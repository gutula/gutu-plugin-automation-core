# Automation Core Flows

## Happy paths

- `automation.routines.create`: Governed action exported by this plugin.
- `automation.routines.update`: Governed action exported by this plugin.
- `automation.routines.trigger`: Governed action exported by this plugin.
- `automation.dead-letters.replay`: Governed action exported by this plugin.

## Operational scenario matrix

- No operational scenario catalog is exported today.

## Action-level flows

### `automation.routines.create`

Governed action exported by this plugin.

Permission: `automation.routines.create`

Business purpose: Expose the plugin’s write boundary through a validated, auditable action contract.

Preconditions:

- Caller input must satisfy the action schema exported by the plugin.
- The caller must satisfy the declared permission and any host-level installation constraints.
- Integration should honor the action’s idempotent semantics.

Side effects:

- Mutates or validates state owned by `automation.routines`, `automation.routine-runs`, `automation.dead-letters`.

Forbidden shortcuts:

- Do not bypass the action contract with undocumented service mutations in application code.
- Do not document extra hooks, retries, or lifecycle semantics unless they are explicitly exported here.


### `automation.routines.update`

Governed action exported by this plugin.

Permission: `automation.routines.update`

Business purpose: Expose the plugin’s write boundary through a validated, auditable action contract.

Preconditions:

- Caller input must satisfy the action schema exported by the plugin.
- The caller must satisfy the declared permission and any host-level installation constraints.
- Integration should honor the action’s idempotent semantics.

Side effects:

- Mutates or validates state owned by `automation.routines`, `automation.routine-runs`, `automation.dead-letters`.

Forbidden shortcuts:

- Do not bypass the action contract with undocumented service mutations in application code.
- Do not document extra hooks, retries, or lifecycle semantics unless they are explicitly exported here.


### `automation.routines.trigger`

Governed action exported by this plugin.

Permission: `automation.routines.trigger`

Business purpose: Expose the plugin’s write boundary through a validated, auditable action contract.

Preconditions:

- Caller input must satisfy the action schema exported by the plugin.
- The caller must satisfy the declared permission and any host-level installation constraints.
- Integration should honor the action’s non-idempotent semantics.

Side effects:

- Mutates or validates state owned by `automation.routines`, `automation.routine-runs`, `automation.dead-letters`.

Forbidden shortcuts:

- Do not bypass the action contract with undocumented service mutations in application code.
- Do not document extra hooks, retries, or lifecycle semantics unless they are explicitly exported here.


### `automation.dead-letters.replay`

Governed action exported by this plugin.

Permission: `automation.dead-letters.replay`

Business purpose: Expose the plugin’s write boundary through a validated, auditable action contract.

Preconditions:

- Caller input must satisfy the action schema exported by the plugin.
- The caller must satisfy the declared permission and any host-level installation constraints.
- Integration should honor the action’s non-idempotent semantics.

Side effects:

- Mutates or validates state owned by `automation.routines`, `automation.routine-runs`, `automation.dead-letters`.

Forbidden shortcuts:

- Do not bypass the action contract with undocumented service mutations in application code.
- Do not document extra hooks, retries, or lifecycle semantics unless they are explicitly exported here.


## Cross-package interactions

- Direct dependencies: `auth-core`, `org-tenant-core`, `role-policy-core`, `audit-core`, `jobs-core`, `issues-core`, `workflow-core`, `notifications-core`, `runtime-bridge-core`
- Requested capabilities: `ui.register.admin`, `api.rest.mount`, `data.write.automation`, `jobs.execute.ai`, `workflow.execute.ai`, `notifications.enqueue.ai`
- Integration model: Actions+Resources+Jobs+UI
- ERPNext doctypes used as parity references: none declared
- Recovery ownership should stay with the host orchestration layer when the plugin does not explicitly export jobs, workflows, or lifecycle events.
