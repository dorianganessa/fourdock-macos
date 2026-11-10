# Third-party notices

Fourdock's original code: MIT (see LICENSE).

No browser is redistributed. Google Chrome must be installed independently and
retains its original signature, name, notices, update mechanism and license.
Google Chrome is not MIT software. Chrome for Testing is used only for synthetic
development checks and is never packaged with Fourdock.

Development dependency: Playwright (Microsoft), Apache-2.0. Its notices and license
are included in node_modules/playwright and playwright-core by npm. It is not
included in the application bundle. npm lockfile pins development dependencies.
AppKit, Foundation and Darwin are system frameworks provided by macOS.

WhatsApp, Telegram, Fastmail and Gmail are third-party services with their own
terms, trademarks and licenses. Fourdock contains no copied service code or logos.
Service letters are plain text. Fourdock is not affiliated with those providers.

## Reused Mission Control client

clients/mission-control contains wacli Mission Control 0.2.6 by Ido Green,
upstream https://github.com/greenido/wacli-ui at commit
4d4ffaf0dbd9cd530f6d298e6da18c110e86e5a6, under the MIT license retained at
clients/mission-control/LICENSE. Original upstream documentation is preserved;
Fourdock modifications are described in clients/mission-control/FOURDOCK.md.
The browser assertion helper follows the architecture documented by the public
domain/Unlicense https://github.com/takeflow-oficial/wa-passkey-connector, with
additional strict origin, gesture, request ownership and timeout checks.
