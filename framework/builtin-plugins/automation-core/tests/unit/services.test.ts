import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createRoutine,
  listAutomationDeadLetters,
  listRoutineRuns,
  replayAutomationDeadLetter,
  triggerRoutine,
  updateRoutine
} from "../../src/services/main.service";

describe("automation-core services", () => {
  let stateDir = "";
  const previousStateDir = process.env.GUTU_STATE_DIR;

  beforeEach(() => {
    stateDir = mkdtempSync(join(tmpdir(), "gutu-automation-state-"));
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

  it("creates, updates, and triggers governed routines", () => {
    const routine = createRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:finance-reminder",
      label: "Finance Reminder",
      trigger: "api",
      operationMode: "issue-drive",
      concurrencyPolicy: "queue",
      catchUpPolicy: "skip",
      workflowDefinitionKey: "ai-run-lifecycle",
      jobKey: "workflow.approvals.remind",
      projectId: "project:pack0-ops",
      runtimeId: "runtime:local-dev"
    });
    const updated = updateRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:finance-reminder",
      status: "active",
      concurrencyPolicy: "drop"
    });
    const run = triggerRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:finance-reminder",
      triggerSource: "api",
      queue: "queue:finance",
      issueSummary: "Finance reminder should create a tracked issue."
    });

    expect(routine.status).toBe("active");
    expect(updated.status).toBe("active");
    expect(run.status).toBe("waiting-human");
    expect(run.issueId).not.toBeNull();
    expect(run.runtimeSessionId).not.toBeNull();
    expect(listRoutineRuns()).toHaveLength(1);
  });

  it("moves failed routines into dead letter and can replay them after repair", () => {
    createRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:broken-runtime",
      label: "Broken Runtime",
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
      routineId: "routine:broken-runtime",
      triggerSource: "api",
      queue: "queue:ops"
    });

    expect(failed.status).toBe("failed");
    expect(failed.deadLetterId).not.toBeNull();
    expect(listAutomationDeadLetters()).toHaveLength(1);

    updateRoutine({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      routineId: "routine:broken-runtime",
      status: "active",
      runtimeId: "runtime:local-dev"
    });

    const replay = replayAutomationDeadLetter({
      tenantId: "tenant-platform",
      actorId: "actor-admin",
      deadLetterId: failed.deadLetterId ?? ""
    });

    expect(replay.status).not.toBe("failed");
    expect(listAutomationDeadLetters().find((entry) => entry.id === failed.deadLetterId)?.status).toBe("replayed");
  });
});
