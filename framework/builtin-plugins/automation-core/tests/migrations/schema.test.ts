import { describe, expect, it } from "bun:test";
import { getTableColumns } from "drizzle-orm";

import { automationDeadLetters, automationRoutineRuns, automationRoutines } from "../../db/schema";

describe("automation schema coverage", () => {
  it("captures routines, routine runs, and dead letters", () => {
    expect(Object.keys(getTableColumns(automationRoutines))).toEqual([
      "id",
      "tenantId",
      "label",
      "status",
      "trigger",
      "operationMode",
      "concurrencyPolicy",
      "catchUpPolicy",
      "workflowDefinitionKey",
      "jobKey",
      "projectId",
      "runtimeId",
      "manualTriggerEnabled",
      "updatedAt"
    ]);
    expect(Object.keys(getTableColumns(automationRoutineRuns))).toEqual([
      "id",
      "tenantId",
      "routineId",
      "status",
      "triggerSource",
      "workflowState",
      "inboxQueue",
      "notificationId",
      "issueId",
      "runtimeSessionId",
      "attemptCount",
      "deadLetterId",
      "failureReason",
      "startedAt",
      "completedAt"
    ]);
    expect(Object.keys(getTableColumns(automationDeadLetters))).toEqual([
      "id",
      "tenantId",
      "routineId",
      "runId",
      "triggerSource",
      "inboxQueue",
      "issueSummary",
      "failureClass",
      "failureReason",
      "status",
      "attemptCount",
      "replayRunId",
      "lastFailedAt",
      "lastReplayedAt"
    ]);
  });
});
