# Performance measurement

Measured 2026-11-06 on macOS 27.0.1 arm64, Chrome for Testing 157.0.8103.38,
Playwright 1.56.1 / Node 26.4.0. No authenticated service benchmark exists.
Raw synthetic evidence: [evidence/benchmark.json](evidence/benchmark.json).

| Observation | Measured value |
|---|---|
| Browser-window API-ready proxy, three fresh profiles | 2.027 s / 1.357 s / 1.006 s |
| Four synthetic documents ready, same runs | 3.953 s / 1.745 s / 1.340 s |
| 50 selection requests, median / p95 | 12.54 ms / 16.34 ms |
| Idle observation duration | 300.31 s, 59 samples |
| Mean idle CPU-time delta / wall-time | 1.40% of one CPU core |
| Mean aggregate RSS / final RSS | 754.71 MiB / 520.67 MiB |
| First idle RSS / process count | 1240.89 MiB / 13 processes |

These are **container fixture measurements**, including the testing browser and
Node automation, excluding the blocked native launcher. Window-ready is the
browser API acknowledgement, not a measured macOS first-visible/first-paint time.
Switch values measure the selection request through the extension, not compositor
presentation. Native-window appearance time is BLOCCATO. Development and other
synthetic UI work continued on this Mac during collection, so this is not a
controlled head-to-head comparison. No performance optimization or "lightweight"
claim follows from these values. Authenticated readiness, real-site idle usage,
longer use and Ferdium comparisons are NON ESEGUITO.

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
RSS sums may double-count shared pages. The ancestry sampler includes live
browser descendants; fully detached/reparented crash reporting helpers may be
excluded. `ps %CPU` is a lifetime average, not an
instantaneous utilization sample; the report additionally uses process CPU-time
deltas over each sample interval. Five-second sampling itself has overhead.

These results describe the synthetic browser container, not WhatsApp/Gmail's
actual work or notification reliability. The fixture uses no credentials.
Longer authenticated usage, real-site idle usage, and a same-conditions Ferdium
comparison remain NON ESEGUITO. Do not optimize by suspending or unloading services.
