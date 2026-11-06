// CI-only GUI observation. Read only basic WindowServer metadata for the supplied
// process; never request screen capture, window titles, or accessibility access.
import Foundation
import CoreGraphics

guard ProcessInfo.processInfo.environment["CI"] == "true",
      CommandLine.arguments.count == 2,
      let pid = Int32(CommandLine.arguments[1]) else { exit(2) }
for _ in 0..<100 {
    let options: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
    let windows = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] ?? []
    let visible = windows.contains { item in
        guard (item[kCGWindowOwnerPID as String] as? Int32) == pid,
              (item[kCGWindowLayer as String] as? Int) == 0,
              let bounds = item[kCGWindowBounds as String] as? [String: Any],
              let width = bounds["Width"] as? Double,
              let height = bounds["Height"] as? Double else { return false }
        return width >= 500 && height >= 300
    }
    if visible { print("PASS packaged native window observed on screen"); exit(0) }
    Thread.sleep(forTimeInterval: 0.1)
}
fputs("Native setup window was not observed\n", stderr)
exit(1)
