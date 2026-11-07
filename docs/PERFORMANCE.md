# Performance measurement

Measured 2026-11-06 on macOS 27.0.1 arm64, Chrome for Testing 157.0.8103.38,
Playwright 1.56.1 / Node 26.4.0. No authenticated service benchmark exists.
Raw synthetic evidence: [evidence/benchmark.json](evidence/benchmark.json).
This is the pre-adoption baseline (initial implementation, f3f010e). The subsequent
live-tab adoption feature changes workspace creation; its startup cost has not
been remeasured. Recollect after real-service integration. The table is historical
measured evidence, not a claim about the final authenticated build.

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

## Real authenticated workspace observer (prepared 2026-11-07)

All four logins and full-restart persistence are now owner-confirmed. The read-only
observer can measure their actual dedicated Chrome process tree without page
inspection, profile file reads, screenshots, UI automation or process termination:

```sh
FOURDOCK_MEASURE_IDLE=1 npm run measure:workspace
```

Use that idle flag only after the owner has finished active tests and leaves all
four loaded services untouched for five minutes. Defaults: 300 seconds, roughly
five-second sampling. Without the flag, workload is labeled uncontrolled. A
10-second uncontrolled smoke run completed successfully on the target; it is not
a five-minute idle result and does not replace the historical fixture baseline.

The script identifies the dedicated browser from main-process arguments without
logging them, then records only anonymous aggregate process count, summed RSS and
CPU-time deltas. Regular Chrome profiles and the Node observer are excluded;
the blocked native launcher is absent. Shared RSS may be double-counted. Detached
helpers and CPU after a child disappears between samples can be missed. CPU is
reported as a percentage of one core. Operator-declared idle is not inferred from
CPU values. If the browser exits, the report is incomplete rather than silently
switching to another browser process.

Reports are written with mode 0600 under
~/Library/Logs/Fourdock/Measurements, outside the source tree. Review any intended
public evidence first. Do not publish account/profile data or claim
actual startup/switch timing from this resource-only observer.
