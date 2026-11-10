import AppKit
import Foundation
import Darwin

let extensionID = "infjmihppfefdefbgjginaijgcponpog"
let home = FileManager.default.homeDirectoryForCurrentUser
let dataRoot = home.appendingPathComponent("Library/Application Support/Fourdock", isDirectory: true)
// AF_UNIX has a short path limit. The per-user folder is private (0700).
let ipcRoot = home.appendingPathComponent(".fourdock", isDirectory: true)
let socketPath = ipcRoot.appendingPathComponent("bridge.sock").path
let chromeURL = URL(fileURLWithPath: "/Applications/Google Chrome.app")
let maxFrame = 1024 * 1024

func writeAll(_ fd: Int32, _ data: Data) -> Bool {
    data.withUnsafeBytes { buffer in
        guard let base = buffer.baseAddress else { return true }
        var offset = 0
        while offset < data.count {
            let n = Darwin.write(fd, base.advanced(by: offset), data.count - offset)
            if n < 0 && errno == EINTR { continue }
            if n <= 0 { return false }; offset += n
        }
        return true
    }
}
func readExact(_ fd: Int32, _ size: Int) -> Data? {
    var data = Data(count: size)
    let ok = data.withUnsafeMutableBytes { buffer -> Bool in
        guard let base = buffer.baseAddress else { return size == 0 }
        var offset = 0
        while offset < size {
            let n = Darwin.read(fd, base.advanced(by: offset), size - offset)
            if n < 0 && errno == EINTR { continue }
            if n <= 0 { return false }; offset += n
        }
        return true
    }
    return ok ? data : nil
}
func readFrame(_ fd: Int32) -> Data? {
    guard let header = readExact(fd, 4) else { return nil }
    let n = header.enumerated().reduce(UInt32(0)) { $0 | UInt32($1.element) << ($1.offset * 8) }
    guard n > 0 && n <= maxFrame else { return nil }
    return readExact(fd, Int(n))
}
func frame(_ data: Data) -> Data {
    var length = UInt32(data.count).littleEndian
    return withUnsafeBytes(of: &length) { Data($0) } + data
}
func address() -> sockaddr_un {
    var addr = sockaddr_un(); addr.sun_family = sa_family_t(AF_UNIX)
    let bytes = Array(socketPath.utf8) + [0]
    precondition(bytes.count <= MemoryLayout.size(ofValue: addr.sun_path), "Home path too long for local bridge")
    withUnsafeMutableBytes(of: &addr.sun_path) { dest in dest.copyBytes(from: bytes) }
    addr.sun_len = UInt8(MemoryLayout<sockaddr_un>.size)
    return addr
}
func connectSocket() -> Int32? {
    let fd = socket(AF_UNIX, SOCK_STREAM, 0); var addr = address()
    let result = withUnsafePointer(to: &addr) { ptr in
        ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { Darwin.connect(fd, $0, socklen_t(MemoryLayout<sockaddr_un>.size)) }
    }
    guard result == 0 else { close(fd); return nil }; return fd
}
func runHost() -> Never {
    signal(SIGPIPE, SIG_IGN)
    guard let fd = connectSocket() else { exit(1) }
    // Dedicated binary framing end-to-end, never stdout diagnostics.
    DispatchQueue.global().async {
        while let data = readFrame(fd) { if !writeAll(STDOUT_FILENO, frame(data)) { break } }
        exit(0)
    }
    while let data = readFrame(STDIN_FILENO) { if !writeAll(fd, frame(data)) { break } }
    close(fd); exit(0)
}

final class Bridge {
    private var listener: Int32 = -1
    private var client: Int32 = -1
    private let lock = NSLock()
    var receive: (([String: Any]) -> Void)?
    var connected: Bool { lock.lock(); defer { lock.unlock() }; return client >= 0 }
    func start() throws {
        try FileManager.default.createDirectory(at: ipcRoot, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        try FileManager.default.setAttributes([.posixPermissions: 0o700], ofItemAtPath: ipcRoot.path)
        // Only unlink our stale private socket after singleton detection.
        unlink(socketPath)
        listener = socket(AF_UNIX, SOCK_STREAM, 0); var addr = address()
        let result = withUnsafePointer(to: &addr) { ptr in ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { Darwin.bind(listener, $0, socklen_t(MemoryLayout<sockaddr_un>.size)) } }
        guard result == 0, listen(listener, 4) == 0 else { throw NSError(domain: "FourdockBridge", code: Int(errno)) }
        chmod(socketPath, 0o600)
        DispatchQueue.global().async { [weak self] in
            guard let self else { return }
            while self.listener >= 0 {
                let fd = accept(self.listener, nil, nil)
                if fd < 0 { break }
                // Accept only this user's native host, using kernel peer credentials.
                var uid: uid_t = 0; var gid: gid_t = 0
                guard getpeereid(fd, &uid, &gid) == 0, uid == getuid() else { close(fd); continue }
                self.lock.lock(); self.client = fd; self.lock.unlock()
                while let data = readFrame(fd) {
                    if let message = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                        DispatchQueue.main.async { self.receive?(message) }
                    }
                }
                self.lock.lock(); self.client = -1; self.lock.unlock(); close(fd)
            }
        }
    }
    func send(_ message: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: message) else { return }
        lock.lock(); defer { lock.unlock() }
        if client >= 0 { _ = writeAll(client, frame(data)) }
    }
    func stop() { if listener >= 0 { close(listener); listener = -1; unlink(socketPath) } }
}

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    let bridge = Bridge()
    var setupWindow: NSWindow?
    var browser: Process?
    var statusLabel: NSTextField?
    let services = ["whatsapp", "telegram", "fastmail", "gmail"]
    var installed: Bool { FileManager.default.fileExists(atPath: dataRoot.appendingPathComponent("extension-connected").path) }

    func applicationDidFinishLaunching(_ notification: Notification) {
        signal(SIGPIPE, SIG_IGN)
        if NSRunningApplication.runningApplications(withBundleIdentifier: "com.fourdock.macos").contains(where: { $0.processIdentifier != getpid() }) {
            for app in NSRunningApplication.runningApplications(withBundleIdentifier: "com.fourdock.macos") where app.processIdentifier != getpid() { app.activate(options: []) }
            NSApp.terminate(nil); return
        }
        do {
            try installResources()
            bridge.receive = { [weak self] message in self?.handle(message) }
            try bridge.start()
        } catch { showError("Cannot prepare the local bridge. Check your user folder permissions."); return }
        makeMenu()
        if installed { launchWorkspace() } else { showSetup() }
    }

    func installResources() throws {
        let fm = FileManager.default
        try fm.createDirectory(at: dataRoot, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        let source = Bundle.main.resourceURL!.appendingPathComponent("extension")
        let target = dataRoot.appendingPathComponent("extension")
        // Update only owned extension source files; never touch browser profile data.
        func copyResources(from source: URL, to target: URL) throws {
            try fm.createDirectory(at: target, withIntermediateDirectories: true)
            for file in try fm.contentsOfDirectory(at: source, includingPropertiesForKeys: [.isDirectoryKey]) {
                let dest = target.appendingPathComponent(file.lastPathComponent)
                if try file.resourceValues(forKeys: [.isDirectoryKey]).isDirectory == true {
                    try copyResources(from: file, to: dest)
                } else {
                    let data = try Data(contentsOf: file)
                    try data.write(to: dest, options: .atomic)
                }
            }
        }
        try copyResources(from: source, to: target)
        let hosts = dataRoot.appendingPathComponent("BrowserProfile/NativeMessagingHosts")
        try fm.createDirectory(at: hosts, withIntermediateDirectories: true)
        let manifest: [String: Any] = ["name": "com.fourdock.bridge", "description": "Fourdock local macOS bridge", "path": Bundle.main.executableURL!.path, "type": "stdio", "allowed_origins": ["chrome-extension://\(extensionID)/"]]
        try JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys]).write(to: hosts.appendingPathComponent("com.fourdock.bridge.json"), options: .atomic)
    }
    func makeMenu() {
        let main = NSMenu(); let item = NSMenuItem(); main.addItem(item)
        let app = NSMenu(title: "Fourdock"); item.submenu = app
        app.addItem(withTitle: "Show Workspace", action: #selector(showWorkspace), keyEquivalent: "0").target = self
        app.addItem(withTitle: "Hide Workspace", action: #selector(hideWorkspace), keyEquivalent: "h").target = self
        app.addItem(withTitle: "Set Up / Repair Extension…", action: #selector(setup), keyEquivalent: ",").target = self
        app.addItem(.separator())
        for (i, name) in ["WhatsApp", "Telegram", "Fastmail", "Gmail"].enumerated() {
            let command = app.addItem(withTitle: name, action: #selector(selectService(_:)), keyEquivalent: String(i + 1)); command.tag = i; command.target = self
        }
        app.addItem(.separator())
        app.addItem(withTitle: "Quit Fourdock and Its Browser", action: #selector(quit), keyEquivalent: "q").target = self
        NSApp.mainMenu = main
    }
    @objc func showWorkspace() { if bridge.connected { bridge.send(["type": "show"]) } else { launchWorkspace() } }
    @objc func hideWorkspace() { bridge.send(["type": "hide"]); setupWindow?.orderOut(nil) }
    @objc func setup() { showSetup() }
    @objc func selectService(_ sender: NSMenuItem) { bridge.send(["type": "select", "service": services[sender.tag]]) }
    @objc func quit() { bridge.send(["type": "quit"]); NSApp.terminate(nil) }

    func launch(_ url: String) {
        guard FileManager.default.fileExists(atPath: chromeURL.path) else { showError("Install official Google Chrome in /Applications, then reopen Fourdock."); return }
        let process = Process(); process.executableURL = chromeURL.appendingPathComponent("Contents/MacOS/Google Chrome")
        process.arguments = ["--user-data-dir=\(dataRoot.appendingPathComponent("BrowserProfile").path)", "--no-first-run", "--no-default-browser-check", url]
        process.standardOutput = FileHandle.nullDevice; process.standardError = FileHandle.nullDevice
        do { try process.run(); if browser?.isRunning != true { browser = process } }
        catch { showError("Could not launch Google Chrome. Reinstall Chrome and retry.") }
    }
    func launchWorkspace() { launch("--app=chrome-extension://\(extensionID)/launch.html") }
    @objc func openSetupBrowser() {
        launch("chrome://extensions/")
        NSWorkspace.shared.selectFile(nil, inFileViewerRootedAtPath: dataRoot.appendingPathComponent("extension").path)
        statusLabel?.stringValue = "Chrome opened with a dedicated Fourdock profile. Load the extension folder shown in Finder."
    }
    @objc func retryConnection() {
        if bridge.connected { setupWindow?.orderOut(nil); bridge.send(["type": "show"]) }
        else { launchWorkspace(); statusLabel?.stringValue = "If Chrome says the page is unavailable, complete Load unpacked first." }
    }
    func showSetup() {
        if let window = setupWindow { window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true); return }
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 620, height: 480), styleMask: [.titled, .closable, .miniaturizable], backing: .buffered, defer: false)
        window.title = "Fourdock · Authentication Prototype"; window.center(); window.delegate = self; window.isReleasedWhenClosed = false
        let stack = NSStackView(); stack.orientation = .vertical; stack.alignment = .leading; stack.spacing = 16; stack.translatesAutoresizingMaskIntoConstraints = false
        let title = NSTextField(labelWithString: "Your four services, together."); title.font = .systemFont(ofSize: 28, weight: .semibold); stack.addArrangedSubview(title)
        let copy = NSTextField(wrappingLabelWithString: "Fourdock uses official Google Chrome with a separate profile so passkeys, phone authentication and work SSO run in the full browser. Your existing browser and Ferdium sessions are untouched.\n\nOne-time setup:\n1. Click Set Up Browser below.\n2. In chrome://extensions, enable Developer mode.\n3. Click Load unpacked and choose the extension folder shown in Finder (⌘⇧G to paste its path).\n4. Click Open workspace in the Fourdock preferences, then sign in through the official service pages.\n\nUse the sidebar's down arrow to hide without unloading. Closing Chrome's window closes tabs; unsaved drafts may be lost.")
        copy.font = .systemFont(ofSize: 14); stack.addArrangedSubview(copy)
        let path = NSTextField(wrappingLabelWithString: dataRoot.appendingPathComponent("extension").path); path.isSelectable = true; path.font = .monospacedSystemFont(ofSize: 11, weight: .regular); stack.addArrangedSubview(path)
        let buttons = NSStackView(); buttons.spacing = 12
        buttons.addArrangedSubview(NSButton(title: "Set Up Browser", target: self, action: #selector(openSetupBrowser)))
        buttons.addArrangedSubview(NSButton(title: "Open Workspace", target: self, action: #selector(retryConnection))); stack.addArrangedSubview(buttons)
        let status = NSTextField(wrappingLabelWithString: "Prototype: real WhatsApp passkey and Gmail SSO are awaiting your test."); status.textColor = .secondaryLabelColor; status.font = .systemFont(ofSize: 12); statusLabel = status; stack.addArrangedSubview(status)
        window.contentView!.addSubview(stack)
        NSLayoutConstraint.activate([stack.leadingAnchor.constraint(equalTo: window.contentView!.leadingAnchor, constant: 28), stack.trailingAnchor.constraint(equalTo: window.contentView!.trailingAnchor, constant: -28), stack.topAnchor.constraint(equalTo: window.contentView!.topAnchor, constant: 28)])
        setupWindow = window; window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
    }
    func showError(_ text: String) { let alert = NSAlert(); alert.messageText = "Fourdock needs attention"; alert.informativeText = text; alert.runModal(); showSetup() }
    func handle(_ message: [String: Any]) {
        switch message["type"] as? String {
        case "hello":
            try? Data("connected\n".utf8).write(to: dataRoot.appendingPathComponent("extension-connected"), options: .atomic)
            statusLabel?.stringValue = "Connected. Open Workspace, then complete the official service logins."
        case "badge":
            let count = max(0, min(999999, message["count"] as? Int ?? 0))
            NSApp.dockTile.badgeLabel = count > 0 ? String(count) : nil
        case "external":
            guard let raw = message["url"] as? String, let url = URL(string: raw), ["https", "http", "mailto", "tel"].contains(url.scheme?.lowercased() ?? "") else { return }
            NSWorkspace.shared.open(url)
        default: break
        }
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool { showWorkspace(); return true }
    func applicationWillTerminate(_ notification: Notification) { bridge.send(["type": "quit"]); if browser?.isRunning == true { browser?.terminate() }; bridge.stop() }
}

if CommandLine.arguments.contains("--native-host") || CommandLine.arguments.contains(where: { $0.hasPrefix("chrome-extension://") }) { runHost() }
if CommandLine.arguments.contains("--self-test") {
    let payload = Data("{\"type\":\"hello\"}".utf8)
    var fds: [Int32] = [0, 0]; precondition(pipe(&fds) == 0)
    precondition(writeAll(fds[1], frame(payload))); precondition(readFrame(fds[0]) == payload)
    close(fds[0]); close(fds[1]); print("PASS native framing; bounded frames; private user socket"); exit(0)
}
let app = NSApplication.shared
let delegate = AppDelegate(); app.delegate = delegate; app.setActivationPolicy(.regular); app.run()
