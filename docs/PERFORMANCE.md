# Performance measurement

Status: collection pending. No authenticated service benchmark exists yet.

The bundle contains only the launcher and extension; Chrome is a separate runtime
dependency and must not be omitted from CPU/memory accounting. A small ZIP does
not imply low memory use. No Ferdium comparison has been run: its existing data
and active accounts were not changed.

`npm run benchmark` uses disposable Chrome for Testing profiles with synthetic
service documents. It records three browser-start-to-window measurements, service
fixture readiness, 50 service-selection request latencies, and five minutes of
idle process-tree samples after loading completes. It includes browser children
and the automation Node process, and excludes other browser/profile instances.
External DNS is blocked in the disposable test browser, because the first
navigation initiated by chrome.windows.create can start before Playwright attaches
to the new target. The test then explicitly navigates each attached tab to the
intercepted fixture. No such test-only DNS switch is used in the real application.
The native launcher is not included because the local build is blocked by AMFI.
RSS sums may double-count shared pages. `ps %CPU` is a lifetime average, not an
instantaneous utilization sample; the report additionally uses process CPU-time
deltas over each sample interval. Five-second sampling itself has overhead.

These results describe the synthetic browser container, not WhatsApp/Gmail's
actual work or notification reliability. The fixture uses no credentials.
Longer authenticated usage, real-site idle usage, and a same-conditions Ferdium
comparison remain NON ESEGUITO. Do not optimize by suspending or unloading services.
