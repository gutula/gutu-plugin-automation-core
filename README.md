# Automation Core

<p align="center">
  <img src="./docs/assets/gutu-mascot.png" alt="Gutu mascot" width="220" />
</p>

Scheduled, API, and webhook-triggered routines with concurrency policy, catch-up policy, issue-drive autopilot posture, and operator follow-up loops for governed work execution.

![Maturity: Hardened](https://img.shields.io/badge/Maturity-Hardened-0f766e) ![Verification: Docs+Build+Typecheck+Lint+Test+Contracts+Integration+Migrations](https://img.shields.io/badge/Verification-Docs%2BBuild%2BTypecheck%2BLint%2BTest%2BContracts%2BIntegration%2BMigrations-6b7280) ![DB: postgres+sqlite](https://img.shields.io/badge/DB-postgres%2Bsqlite-2563eb) ![Integration Model: Actions+Resources+UI](https://img.shields.io/badge/Integration%20Model-Actions%2BResources%2BUI-6b7280)

**Maturity Tier:** `Hardened`

## Part Of The Gutu Stack

| Aspect | Value |
| --- | --- |
| Repo kind | First-party plugin |
| Domain group | Platform Backbone |
| Primary focus | routines, routine runs, follow-up inboxes, SLA-aware automation loops |
| Best when | You want `paperclip`-style routines and collaboration loops without making timers and reminders invisible side effects. |
| Composes through | Actions+Resources+UI |

- `automation-core` turns schedules, API triggers, and webhook triggers into typed platform objects with explicit concurrency and catch-up policy.
- It reuses `jobs-core`, `workflow-core`, and `notifications-core` instead of building a parallel scheduler stack.

## What It Does Now

- Exports 4 governed actions: `automation.routines.create`, `automation.routines.update`, `automation.routines.trigger`, `automation.dead-letters.replay`.
- Owns 3 public resources: `automation.routines`, `automation.routine-runs`, `automation.dead-letters`.
- Adds an `automation` workspace with a control room and an inbox surface for waiting-human and escalated runs.
- Persists concurrency policy, catch-up policy, issue-drive mode, runtime targeting, manual trigger posture, workflow linkage, queue-facing notification state, and dead-letter replay posture for each routine run.
- Links routine runs to collaboration issues and runtime sessions when autopilot routines are configured for operator-facing follow-up.
- Covers schedule, API, webhook, issue-drive, and runtime-targeted operator follow-up loops in tests.

## Maturity

`automation-core` is `Hardened` because routine behavior is durable, policy-driven, operator-visible, and verified across unit, contract, integration, and migration lanes.

## Verified Capability Summary

- Group: **Platform Backbone**
- Verification surface: **Docs+Build+Typecheck+Lint+Test+Contracts+Integration+Migrations**
- Tests discovered: **6** files across unit, contract, integration, and migration lanes
- Integration model: **Actions+Resources+UI**
- Database support: **postgres + sqlite**

## Dependency And Compatibility Summary

| Field | Value |
| --- | --- |
| Package | `@plugins/automation-core` |
| Manifest ID | `automation-core` |
| Repo | `gutu-plugin-automation-core` |
| Depends On | `auth-core`, `org-tenant-core`, `role-policy-core`, `audit-core`, `jobs-core`, `workflow-core`, `notifications-core`, `issues-core`, `runtime-bridge-core` |
| Requested Capabilities | `ui.register.admin`, `api.rest.mount`, `data.write.automation`, `jobs.execute.ai`, `workflow.execute.ai`, `notifications.enqueue.ai` |
| Provided Capabilities | `automation.routines`, `automation.routine-runs` |
| Runtime | bun>=1.3.12 |
| Database | postgres, sqlite |
| Integration Model | Actions+Resources+UI |

## Capability Matrix

| Surface | Count | Details |
| --- | --- | --- |
| Actions | 4 | `automation.routines.create`, `automation.routines.update`, `automation.routines.trigger`, `automation.dead-letters.replay` |
| Resources | 3 | `automation.routines`, `automation.routine-runs`, `automation.dead-letters` |
| Workspaces | 1 | `automation` |
| Inbox Surfaces | 1 | routine waiting-human and escalation queue |
| UI | Present | control room, inbox, admin commands |

## Quick Start For Integrators

Use this repo inside a compatible Gutu workspace so its `workspace:*` dependencies resolve truthfully.

```bash
bun install
bun run build
bun run test
bun run docs:check
```

```ts
import {
  manifest,
  createRoutineAction,
  triggerRoutineAction,
  RoutineResource,
  RoutineRunResource
} from "@plugins/automation-core";

console.log(manifest.id);
console.log(createRoutineAction.id);
console.log(triggerRoutineAction.id);
console.log(RoutineResource.id, RoutineRunResource.id);
```

## Current Test Coverage

- Root verification scripts: `bun run build`, `bun run typecheck`, `bun run lint`, `bun run test`, `bun run test:contracts`, `bun run test:integration`, `bun run test:migrations`, `bun run test:unit`, `bun run docs:check`
- Unit files: 2
- Contracts files: 2
- Integration files: 1
- Migrations files: 1

## Known Boundaries And Non-Goals

- This plugin does not replace Codex desktop automations or heartbeat scheduling; it models platform routines inside the framework runtime.
- It currently relies on same-process scheduler composition via `jobs-core`.
- Long-horizon schedule materialization and fleet-wide pause or resume posture are not exported yet.
- It links to collaboration issues and runtime sessions but does not own those lower-level control planes.

## Recommended Next Milestones

- Add richer scheduler crash recovery and replay reports.
- Expand SLA dashboards for reminders, escalations, and missed-trigger analysis.
- Add policy-aware bulk pause/resume controls for routine fleets.
- Add issue-board and runtime-console pivots directly from autopilot run history.

## More Docs

See [DEVELOPER.md](./DEVELOPER.md), [TODO.md](./TODO.md), [SECURITY.md](./SECURITY.md), and [CONTRIBUTING.md](./CONTRIBUTING.md).
