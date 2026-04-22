import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createRoutine, getAutomationOverview, replayAutomationDeadLetter, triggerRoutine, updateRoutine } from "../../src/services/main.service";

describe("automation routines", () => {
  let stateDir = "";
  const previousStateDir = process.env.GUTU_STATE_DIR;

  beforeEach(() => {
    stateDir = mkdtempSync(join(tmpdir(), "gutu-automation-integration-"));
    process.env.GUTU_STATE_DIR = stateDir;
  });

  afterEach(() => {
    rmSync(stateDir, { recursive: true, force: true });
    if (previousStateDir === undefined) {
      delete process.env.GUTU_STATE_DIR;
      return;
    }
    process.env.GUTU_STATE_DIR = previousStateDir;
  });

  it("applies drop concurrency when a routine is already waiting for human input", () => {
    createRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:webhook-review",
      label: "Webhook Review",
      trigger: "webhook",
      operationMode: "issue-drive",
      concurrencyPolicy: "drop",
      catchUpPolicy: "collapse",
      workflowDefinitionKey: "ai-run-lifecycle",
      jobKey: "workflow.approvals.remind",
      projectId: "project:pack0-ops",
      runtimeId: "runtime:local-dev"
    });

    const first = triggerRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:webhook-review",
      triggerSource: "webhook",
      queue: "queue:ops"
    });
    const second = triggerRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:webhook-review",
      triggerSource: "webhook",
      queue: "queue:ops"
    });

    expect(first.status).toBe("waiting-human");
    expect(first.issueId).not.toBeNull();
    expect(first.runtimeSessionId).not.toBeNull();
    expect(second.dropped).toBe(true);
  });

  it("tracks dead letters and replay recovery for failed runtime targeting", () => {
    createRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:runtime-failure",
      label: "Runtime Failure",
      trigger: "api",
      operationMode: "run-only",
      concurrencyPolicy: "queue",
      catchUpPolicy: "skip",
      workflowDefinitionKey: "ai-run-lifecycle",
      jobKey: "ai.runs.intake",
      runtimeId: "runtime:missing"
    });

    const failed = triggerRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:runtime-failure",
      triggerSource: "api",
      queue: "queue:ops"
    });

    expect(failed.status).toBe("failed");
    expect(getAutomationOverview().totals.deadLetters).toBeGreaterThanOrEqual(1);

    updateRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:runtime-failure",
      status: "active",
      runtimeId: "runtime:local-dev"
    });

    const replay = replayAutomationDeadLetter({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      deadLetterId: failed.deadLetterId ?? ""
    });

    expect(replay.status).not.toBe("failed");
  });
});
