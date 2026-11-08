import AppKit
import WebKit

// Compatibility probe only. No Chrome integration, account inspection, custom
// user agent, injected scripts, certificate overrides or passkey interception.
struct ProbeService {
    let name: String
    let url: URL
    let storeID: UUID
    static let real = [
        ProbeService(name: "WhatsApp", url: URL(string: "https://web.whatsapp.com/")!,
                     storeID: UUID(uuidString: "EA9FBE66-5D63-4E1E-A88E-F4BB575FAE01")!),
        ProbeService(name: "Gmail", url: URL(string: "https://mail.google.com/")!,
                     storeID: UUID(uuidString: "EA9FBE66-5D63-4E1E-A88E-F4BB575FAE02")!)
    ]
}

@MainActor
final class ProbeApp: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate, WKUIDelegate {
    let services: [ProbeService]
    let fixtures: Bool
    var ready: (() -> Void)?
    var window: NSWindow!
    var views: [WKWebView] = []
    var popups: [NSWindow] = []
    var selected = 0
    private let content = NSView()
    private let origin = NSTextField(labelWithString: "")
    private let status = NSTextField(labelWithString: "")
    private var buttons: [NSButton] = []

    init(services: [ProbeService] = ProbeService.real, fixtures: Bool = false) {
        self.services = services
        self.fixtures = fixtures
        super.init()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        makeMenu()
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1200, height: 800),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.title = "Fourdock — WebKit compatibility probe"
        window.minSize = NSSize(width: 720, height: 500)
        window.isReleasedWhenClosed = false
        window.delegate = self
        let root = window.contentView!
        let rail = NSStackView()
        rail.orientation = .vertical
        rail.alignment = .leading
        rail.spacing = 12
        for (index, service) in services.enumerated() {
            let button = NSButton(title: service.name, target: self, action: #selector(selectService(_:)))
            button.tag = index
            button.setButtonType(.toggle)
            buttons.append(button)
            rail.addArrangedSubview(button)
        }
        let note = NSTextField(wrappingLabelWithString: "Separate WebKit profiles.\nAuthentication test only.")
        note.font = .systemFont(ofSize: 11)
        note.textColor = .secondaryLabelColor
        rail.addArrangedSubview(note)
        let header = NSStackView(views: [origin, status])
        header.spacing = 16
        status.textColor = .secondaryLabelColor
        for view in [rail, header, content] {
            view.translatesAutoresizingMaskIntoConstraints = false
            root.addSubview(view)
        }
        NSLayoutConstraint.activate([
            rail.leadingAnchor.constraint(equalTo: root.leadingAnchor, constant: 12),
            rail.topAnchor.constraint(equalTo: root.topAnchor, constant: 16),
            rail.widthAnchor.constraint(equalToConstant: 132),
            header.leadingAnchor.constraint(equalTo: content.leadingAnchor, constant: 12),
            header.trailingAnchor.constraint(equalTo: root.trailingAnchor, constant: -12),
            header.topAnchor.constraint(equalTo: root.topAnchor, constant: 10),
            header.heightAnchor.constraint(equalToConstant: 24),
            content.leadingAnchor.constraint(equalTo: rail.trailingAnchor, constant: 12),
            content.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            content.topAnchor.constraint(equalTo: header.bottomAnchor, constant: 8),
            content.bottomAnchor.constraint(equalTo: root.bottomAnchor)
        ])
        for service in services {
            let config = WKWebViewConfiguration()
            config.websiteDataStore = WKWebsiteDataStore(forIdentifier: service.storeID)
            // Synthetic popup tests run in a separate fixture executable/store.
            config.preferences.javaScriptCanOpenWindowsAutomatically = fixtures
            let view = WKWebView(frame: .zero, configuration: config)
            configure(view)
            view.translatesAutoresizingMaskIntoConstraints = false
            content.addSubview(view)
            NSLayoutConstraint.activate([
                view.leadingAnchor.constraint(equalTo: content.leadingAnchor),
                view.trailingAnchor.constraint(equalTo: content.trailingAnchor),
                view.topAnchor.constraint(equalTo: content.topAnchor),
                view.bottomAnchor.constraint(equalTo: content.bottomAnchor)
            ])
            views.append(view)
            view.load(URLRequest(url: service.url))
        }
        select(0)
        window.center()
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        ready?()
    }

    private func configure(_ view: WKWebView) {
        view.navigationDelegate = self
        view.uiDelegate = self
        view.allowsBackForwardNavigationGestures = true
    }

    func select(_ index: Int) {
        guard views.indices.contains(index) else { return }
        selected = index
        for (i, view) in views.enumerated() { view.isHidden = i != index }
        for (i, button) in buttons.enumerated() { button.state = i == index ? .on : .off }
        showOrigin(views[index])
        window.makeFirstResponder(views[index])
    }

    @objc private func selectService(_ sender: NSButton) { select(sender.tag) }
    @objc private func selectMenu(_ sender: NSMenuItem) { select(sender.tag) }
    @objc private func reloadSelected() { views[selected].reload() }
    @objc private func goBack() { views[selected].goBack() }

    private func showOrigin(_ view: WKWebView) {
        if let panel = popups.first(where: { $0.contentView === view }) {
            panel.title = view.url?.host.map { "Fourdock — \(view.url?.scheme ?? "")://\($0)" } ?? "Fourdock — authentication window"
        }
        guard views.indices.contains(selected), view === views[selected] else { return }
        // Display only the real origin in native UI; never collect URL paths,
        // page titles, cookies, forms or account contents in diagnostics.
        let url = view.url
        origin.stringValue = url?.host.map { "\(url?.scheme ?? "")://\($0)" } ?? services[selected].name
        status.stringValue = view.isLoading ? "Loading…" : ""
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) { showOrigin(webView) }
    func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) { showOrigin(webView) }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { showOrigin(webView) }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { failed(webView, error) }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { failed(webView, error) }
    private func failed(_ view: WKWebView, _ error: Error) {
        guard view === views[selected], (error as NSError).code != NSURLErrorCancelled else { return }
        status.stringValue = "Navigation failed (\((error as NSError).code))."
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        if webView === views[selected] { status.stringValue = "Web process stopped. Use View → Reload when ready." }
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { decisionHandler(.cancel); return }
        let allowed = url.scheme == "https" || url.absoluteString == "about:blank" ||
            (fixtures && url.scheme == "http" && url.host == "127.0.0.1")
        if !allowed && webView === views[selected] { status.stringValue = "This probe supports HTTPS navigation only." }
        decisionHandler(allowed ? .allow : .cancel)
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        // Use WebKit's supplied configuration to retain the opener's store and
        // window.opener relationship. No external-browser cookie transfer.
        let popup = WKWebView(frame: .zero, configuration: configuration)
        configure(popup)
        let panel = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 800, height: 650),
                             styleMask: [.titled, .closable, .resizable], backing: .buffered, defer: false)
        panel.title = "Fourdock — authentication window"
        panel.isReleasedWhenClosed = false
        panel.delegate = self
        panel.contentView = popup
        popups.append(panel)
        panel.center()
        panel.makeKeyAndOrderFront(nil)
        return popup
    }
    func webViewDidClose(_ webView: WKWebView) {
        popups.first(where: { $0.contentView === webView })?.close()
    }
    func windowWillClose(_ notification: Notification) {
        popups.removeAll { $0 === notification.object as? NSWindow }
    }
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = NSAlert()
        alert.messageText = frame.securityOrigin.host
        alert.informativeText = message
        alert.runModal()
        completionHandler()
    }
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = NSAlert()
        alert.messageText = frame.securityOrigin.host
        alert.informativeText = message
        alert.addButton(withTitle: "OK")
        alert.addButton(withTitle: "Cancel")
        completionHandler(alert.runModal() == .alertFirstButtonReturn)
    }

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        guard sender === window else { return true }
        sender.orderOut(nil)
        return false
    }
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        window.makeKeyAndOrderFront(nil)
        return true
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }

    private func makeMenu() {
        let menu = NSMenu()
        let appItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "Quit Fourdock WebKit Probe", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu
        menu.addItem(appItem)
        let fileItem = NSMenuItem()
        let fileMenu = NSMenu(title: "File")
        fileMenu.addItem(withTitle: "Hide Window", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        fileItem.submenu = fileMenu
        menu.addItem(fileItem)
        let editItem = NSMenuItem()
        let edit = NSMenu(title: "Edit")
        for (title, action, key) in [("Undo", "undo:", "z"), ("Cut", "cut:", "x"), ("Copy", "copy:", "c"),
                                      ("Paste", "paste:", "v"), ("Select All", "selectAll:", "a")] {
            edit.addItem(withTitle: title, action: Selector(action), keyEquivalent: key)
        }
        editItem.submenu = edit
        menu.addItem(editItem)
        let viewItem = NSMenuItem()
        let viewMenu = NSMenu(title: "View")
        for (index, service) in services.enumerated() {
            let item = NSMenuItem(title: service.name, action: #selector(selectMenu(_:)), keyEquivalent: "\(index + 1)")
            item.target = self
            item.tag = index
            viewMenu.addItem(item)
        }
        let back = viewMenu.addItem(withTitle: "Back", action: #selector(goBack), keyEquivalent: "[")
        back.target = self
        let reload = viewMenu.addItem(withTitle: "Reload Selected Service", action: #selector(reloadSelected), keyEquivalent: "r")
        reload.target = self
        viewItem.submenu = viewMenu
        menu.addItem(viewItem)
        NSApp.mainMenu = menu
    }
}
