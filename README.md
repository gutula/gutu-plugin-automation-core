# Automation Core

<p align="center">
  <img src="./docs/assets/gutu-mascot.png" alt="Gutu mascot" width="220" />
</p>

Scheduled, API, and webhook-triggered routines with governed concurrency, catch-up policy, and operator follow-up loops.

![Maturity: Hardened](https://img.shields.io/badge/Maturity-Hardened-2563eb) ![Verification: Build+Typecheck+Lint+Test+Contracts+Migrations+Integration](https://img.shields.io/badge/Verification-Build%2BTypecheck%2BLint%2BTest%2BContracts%2BMigrations%2BIntegration-2563eb) ![DB: postgres+sqlite](https://img.shields.io/badge/DB-postgres%2Bsqlite-2563eb) ![Integration Model: Actions+Resources+Jobs+UI](https://img.shields.io/badge/Integration%20Model-Actions%2BResources%2BJobs%2BUI-2563eb)

## Part Of The Gutu Stack

| Aspect | Value |
| --- | --- |
| Repo kind | First-party plugin |
| Domain group | Platform Backbone |
| Default category | Platform Governance / Automation |
| Primary focus | automation definitions, scheduled execution, governed follow-up |
| Best when | You need a governed domain boundary with explicit contracts and independent release cadence. |
| Composes through | Actions+Resources+Jobs+UI |

- Gutu keeps plugins as independent repos with manifest-governed boundaries, compatibility channels, and verification lanes instead of hiding everything behind one giant mutable codebase.
- This plugin is meant to compose through explicit actions, resources, jobs, workflows, and runtime envelopes, not through undocumented hook chains.

## What It Does Now

Coordinates automation definitions, recurring execution, and governed follow-up behavior without hiding work inside undocumented cron glue.

- Exports 4 governed actions: `automation.routines.create`, `automation.routines.update`, `automation.routines.trigger`, `automation.dead-letters.replay`.
- Owns 3 resource contracts: `automation.routines`, `automation.routine-runs`, `automation.dead-letters`.
- Adds richer admin workspace contributions on top of the base UI surface.
- Defines a durable data schema contract even though no explicit SQL helper module is exported.

## Maturity

**Maturity Tier:** `Hardened`

This tier is justified because unit coverage exists, contract coverage exists, integration coverage exists, and migration coverage exists.

## Verified Capability Summary

- Domain group: **Platform Backbone**
- Default category: **Platform Governance / Automation**
- Verification surface: **Build+Typecheck+Lint+Test+Contracts+Migrations+Integration**
- Tests discovered: **6** total files across unit, contract, integration, migration lanes
- Integration model: **Actions+Resources+Jobs+UI**
- Database support: **postgres + sqlite**

## Dependency And Compatibility Summary

| Field | Value |
| --- | --- |
| Package | `@plugins/automation-core` |
| Manifest ID | `automation-core` |
| Repo | [gutu-plugin-automation-core](https://github.com/gutula/gutu-plugin-automation-core) |
| Depends On | `auth-core`, `org-tenant-core`, `role-policy-core`, `audit-core`, `jobs-core`, `issues-core`, `workflow-core`, `notifications-core`, `runtime-bridge-core` |
| Requested Capabilities | `ui.register.admin`, `api.rest.mount`, `data.write.automation`, `jobs.execute.ai`, `workflow.execute.ai`, `notifications.enqueue.ai` |
| Provided Capabilities | `automation.routines`, `automation.routine-runs` |
| Runtime | bun>=1.3.12 |
| Database | postgres, sqlite |
| Integration Model | Actions+Resources+Jobs+UI |

## Capability Matrix

| Surface | Count | Details |
| --- | --- | --- |
| Actions | 4 | `automation.routines.create`, `automation.routines.update`, `automation.routines.trigger`, `automation.dead-letters.replay` |
| Resources | 3 | `automation.routines`, `automation.routine-runs`, `automation.dead-letters` |
| Jobs | 0 | No job catalog exported |
| Workflows | 0 | No workflow catalog exported |
| UI | Present | base UI surface, admin contributions |
| Owned Entities | 0 | No explicit domain catalog yet |
| Reports | 0 | No explicit report catalog yet |
| Exception Queues | 0 | No explicit exception queues yet |
| Operational Scenarios | 0 | No explicit operational scenario matrix yet |
| Settings Surfaces | 0 | No explicit settings surface catalog yet |
| ERPNext Refs | 0 | No direct ERPNext reference mapping declared |

## Quick Start For Integrators

Use this repo inside a **compatible Gutu workspace** or the **ecosystem certification workspace** so its `workspace:*` dependencies resolve honestly.

```bash
# from a compatible workspace that already includes this plugin's dependency graph
bun install
bun run build
bun run test
bun run docs:check
```

```ts
import { manifest, createRoutineAction, RoutineResource, adminContributions, uiSurface } from "@plugins/automation-core";

console.log(manifest.id);
console.log(createRoutineAction.id);
console.log(RoutineResource.id);
```

Use the root repo scripts for day-to-day work **after the workspace is bootstrapped**, or run the nested package directly from `framework/builtin-plugins/automation-core` if you need lower-level control.

## Current Test Coverage

- Root verification scripts: `bun run build`, `bun run typecheck`, `bun run lint`, `bun run test`, `bun run test:contracts`, `bun run test:integration`, `bun run test:migrations`, `bun run test:unit`, `bun run docs:check`
- Unit files: 2
- Contracts files: 2
- Integration files: 1
- Migrations files: 1

## Known Boundaries And Non-Goals

- Not a generic WordPress-style hook bus or plugin macro system.
- Not a product-specific UX suite beyond the exported admin or portal surfaces that ship today.
- Cross-plugin composition should use Gutu command, event, job, and workflow primitives. This repo should not be documented as exposing a generic WordPress-style hook system unless one is explicitly exported.

## Recommended Next Milestones

- Add stronger operator diagnostics and replay controls where automations start owning more business-critical follow-up work.
- Clarify execution handoff patterns with jobs, workflows, and notifications as automation coverage broadens.
- Add stronger operator-facing reconciliation and observability surfaces where runtime state matters.
- Promote any currently implicit cross-plugin lifecycles into explicit command, event, or job contracts when those integrations stabilize.
- Promote important downstream reactions into explicit commands, jobs, or workflow steps instead of relying on implicit coupling.

## More Docs

See [DEVELOPER.md](./DEVELOPER.md), [TODO.md](./TODO.md), [SECURITY.md](./SECURITY.md), [CONTRIBUTING.md](./CONTRIBUTING.md). The internal domain sources used to build those docs live under:

- `plugins/gutu-plugin-automation-core/framework/builtin-plugins/automation-core/docs/AGENT_CONTEXT.md`
- `plugins/gutu-plugin-automation-core/framework/builtin-plugins/automation-core/docs/BUSINESS_RULES.md`
- `plugins/gutu-plugin-automation-core/framework/builtin-plugins/automation-core/docs/EDGE_CASES.md`
- `plugins/gutu-plugin-automation-core/framework/builtin-plugins/automation-core/docs/FLOWS.md`
- `plugins/gutu-plugin-automation-core/framework/builtin-plugins/automation-core/docs/GLOSSARY.md`
- `plugins/gutu-plugin-automation-core/framework/builtin-plugins/automation-core/docs/MANDATORY_STEPS.md`
