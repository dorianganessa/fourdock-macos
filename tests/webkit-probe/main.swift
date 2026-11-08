import AppKit
import WebKit

// Separate executable. Production account views have no script evaluation or
// cookie inspection. This entry point only accepts CI loopback fixture URLs.
guard ProcessInfo.processInfo.environment["CI"] == "true",
      CommandLine.arguments.count == 5,
      let base = URL(string: CommandLine.arguments[1]),
      base.scheme == "http", base.host == "127.0.0.1",
      let first = UUID(uuidString: CommandLine.arguments[2]),
      let second = UUID(uuidString: CommandLine.arguments[3]), first != second,
      ["write", "read"].contains(CommandLine.arguments[4]) else { exit(2) }
let phase = CommandLine.arguments[4]
let services = ["whatsapp", "gmail"].enumerated().map { index, name in
    ProbeService(name: name, url: base.appendingPathComponent(name).appending(queryItems: [URLQueryItem(name: "phase", value: phase)]),
                 storeID: index == 0 ? first : second)
}

enum CheckFailure: Error { case failed(String) }
@MainActor
func require(_ value: Bool, _ name: String) throws {
    if !value { throw CheckFailure.failed(name) }
}
@MainActor
func script(_ view: WKWebView, _ js: String) async throws -> Any? {
    try await withCheckedThrowingContinuation { continuation in
        view.evaluateJavaScript(js) { value, error in
            if let error { continuation.resume(throwing: error) }
            else { continuation.resume(returning: value) }
        }
    }
}
@MainActor
func cookies(_ view: WKWebView) async -> [HTTPCookie] {
    await withCheckedContinuation { continuation in
        view.configuration.websiteDataStore.httpCookieStore.getAllCookies { continuation.resume(returning: $0) }
    }
}
@MainActor
func eventually(_ name: String, _ check: () async throws -> Bool) async throws {
    for _ in 0..<150 {
        if (try? await check()) == true { return }
        try await Task.sleep(nanoseconds: 100_000_000)
    }
    throw CheckFailure.failed(name)
}
MainActor.assumeIsolated {
let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = ProbeApp(services: services, fixtures: true)
delegate.ready = {
    Task { @MainActor in
        do {
            for (i, view) in delegate.views.enumerated() {
                let name = services[i].name
                try await eventually("fixture loaded") {
                    try await script(view, "document.body.dataset.fixture") as? String == name
                }
                if phase == "write" {
                    _ = try await script(view, "localStorage.setItem('probe', '\(name)'); document.querySelector('input').value='unsent fixture'; window.identity='\(name)'; true")
                }
                let stored = try await script(view, "localStorage.getItem('probe')") as? String
                try require(stored == name, "isolated localStorage across restart")
                let storedCookies = await cookies(view)
                try require(storedCookies.contains { $0.name == "fixture" && $0.value == name && $0.isHTTPOnly }, "isolated persistent HttpOnly cookie")
                try require(!storedCookies.contains { $0.name == "fixture" && $0.value != name }, "no cookie sharing")
            }
            if phase == "write" {
                for index in 0..<50 { delegate.select(index % 2) }
                for (i, view) in delegate.views.enumerated() {
                    try require(try await script(view, "window.identity") as? String == services[i].name, "switch preserves document")
                    try require(try await script(view, "document.querySelector('input').value") as? String == "unsent fixture", "switch preserves draft")
                }
                delegate.window.performClose(nil)
                try require(!delegate.window.isVisible, "close hides window")
                _ = delegate.applicationShouldHandleReopen(app, hasVisibleWindows: false)
                try require(delegate.window.isVisible, "Dock reopen restores window")
                try require(try await script(delegate.views[0], "document.querySelector('input').value") as? String == "unsent fixture", "hide retains draft")
                delegate.select(0)
                _ = try await script(delegate.views[0], "window.open('/popup', 'fixturePopup'); true")
                try await eventually("popup creation") { delegate.popups.count == 1 }
                guard let popup = delegate.popups.first?.contentView as? WKWebView else { throw CheckFailure.failed("popup view") }
                try require(popup.configuration.websiteDataStore.identifier == first, "popup preserves profile")
                try await eventually("popup opener") {
                    try await script(popup, "!!window.opener && document.body.dataset.fixture === 'popup'") as? Bool == true
                }
                _ = try await script(popup, "window.opener.popupResult='fixture'; window.close(); true")
                try await eventually("popup close and result") {
                    let result = try await script(delegate.views[0], "window.popupResult") as? String
                    return delegate.popups.isEmpty && result == "fixture"
                }
            }
            // Allow WebKit's asynchronous persistence to settle before full exit.
            try await Task.sleep(nanoseconds: 2_000_000_000)
            print("PASS WebKit synthetic \(phase): isolated storage/cookies\(phase == "write" ? ", 50 switches/drafts, close/reopen, popup/opener/close" : ", full-process restart")")
            app.terminate(nil)
        } catch {
            // Never print JavaScript errors/URLs. This executable has fixtures
            // only, but keep diagnostics as narrow as the production app.
            if case CheckFailure.failed(let name) = error { fputs("FAIL WebKit fixture: \(name)\n", stderr) }
            else { fputs("FAIL WebKit fixture operation\n", stderr) }
            exit(1)
        }
    }
}
app.delegate = delegate
app.run()
}
