import AppKit

MainActor.assumeIsolated {
    let app = NSApplication.shared
    app.setActivationPolicy(.regular)
    let delegate = ProbeApp()
    app.delegate = delegate
    withExtendedLifetime(delegate) { app.run() }
}
