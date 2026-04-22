# Automation Core TODO

**Maturity Tier:** `Hardened`

## Shipped Now

- Added durable routines and routine-run resources.
- Added create, update, and trigger action contracts.
- Added `automation` control room and inbox surfaces.
- Added issue-drive autopilot composition through `issues-core` and `runtime-bridge-core`.
- Added routine posture for operation mode, runtime targeting, linked issue/session records, and manual-trigger gating.
- Added integration and migration tests covering concurrency, waiting-human, follow-up, issue-drive, and runtime-targeted behavior.
- Added dead-letter persistence and replay flows for failed routine runs.

## Current Gaps

- Long-horizon schedule materialization is not modeled yet.
- Routine fleet-level analytics can go deeper.
- Autopilot policy authoring is still lightweight compared with the richer builder publish machinery elsewhere in the stack.

## Recommended Next

- Add scheduler crash-recovery and missed-trigger analysis.
- Add richer SLA dashboards for reminders, escalations, and inbox pressure.
- Add policy-aware bulk pause and resume for routine fleets.
- Add deeper issue-board and runtime-console pivots for autopilot operators.

## Later / Optional

- Rich import/export for routine packs after schedule semantics stabilize.
- Cross-workspace routine federation for larger multi-tenant operators.
