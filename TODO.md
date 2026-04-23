# Automation Core TODO

**Maturity Tier:** `Hardened`

## Shipped Now

- Exports 4 governed actions: `automation.routines.create`, `automation.routines.update`, `automation.routines.trigger`, `automation.dead-letters.replay`.
- Owns 3 resource contracts: `automation.routines`, `automation.routine-runs`, `automation.dead-letters`.
- Adds richer admin workspace contributions on top of the base UI surface.
- Defines a durable data schema contract even though no explicit SQL helper module is exported.

## Current Gaps

- No standalone plugin-owned event, job, or workflow catalog is exported yet; compose it through actions, resources, and the surrounding Gutu runtime.
- The repo does not yet export a domain parity catalog with owned entities, reports, settings surfaces, and exception queues.

## Recommended Next

- Add stronger operator diagnostics and replay controls where automations start owning more business-critical follow-up work.
- Clarify execution handoff patterns with jobs, workflows, and notifications as automation coverage broadens.
- Add stronger operator-facing reconciliation and observability surfaces where runtime state matters.
- Promote any currently implicit cross-plugin lifecycles into explicit command, event, or job contracts when those integrations stabilize.
- Promote important downstream reactions into explicit commands, jobs, or workflow steps instead of relying on implicit coupling.

## Later / Optional

- Dedicated federation or external identity/provider adapters once the core contracts are stable.
