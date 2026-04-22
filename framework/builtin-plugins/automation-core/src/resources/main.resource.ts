import { defineResource } from "@platform/schema";
import { z } from "zod";

import { automationDeadLetters, automationRoutineRuns, automationRoutines } from "../../db/schema";

export const RoutineResource = defineResource({
  id: "automation.routines",
  description: "Governed routines that run on schedules, API requests, or webhook ingress.",
  businessPurpose: "Track automation definitions with concurrency and catch-up policy.",
  table: automationRoutines,
  contract: z.object({
    id: z.string().min(2),
    tenantId: z.string().min(2),
    label: z.string().min(2),
    status: z.enum(["draft", "active", "paused"]),
    trigger: z.enum(["schedule", "api", "webhook"]),
    operationMode: z.enum(["follow-up", "run-only", "issue-drive"]),
    concurrencyPolicy: z.enum(["queue", "drop", "replace"]),
    catchUpPolicy: z.enum(["skip", "replay-missed", "collapse"]),
    workflowDefinitionKey: z.string().min(2),
    jobKey: z.string().min(2),
    projectId: z.string().nullable(),
    runtimeId: z.string().nullable(),
    manualTriggerEnabled: z.enum(["true", "false"]),
    updatedAt: z.string()
  }),
  fields: {
    label: { searchable: true, sortable: true, label: "Routine" },
    status: { filter: "select", label: "Status" },
    trigger: { filter: "select", label: "Trigger" },
    operationMode: { filter: "select", label: "Mode" },
    concurrencyPolicy: { filter: "select", label: "Concurrency" },
    catchUpPolicy: { filter: "select", label: "Catch-Up" },
    updatedAt: { sortable: true, label: "Updated" }
  },
  admin: {
    autoCrud: true,
    defaultColumns: ["label", "status", "trigger", "operationMode", "concurrencyPolicy", "catchUpPolicy", "updatedAt"]
  },
  portal: { enabled: false }
});

export const RoutineRunResource = defineResource({
  id: "automation.routine-runs",
  description: "Execution history for governed routines.",
  businessPurpose: "Show queueing, human waits, failures, escalations, and completions for operator-facing automations.",
  table: automationRoutineRuns,
  contract: z.object({
    id: z.string().min(2),
    tenantId: z.string().min(2),
    routineId: z.string().min(2),
    status: z.enum(["queued", "running", "waiting-human", "completed", "failed", "escalated"]),
    triggerSource: z.enum(["schedule", "api", "webhook"]),
    workflowState: z.string().min(2),
    inboxQueue: z.string().min(2),
    notificationId: z.string().nullable(),
    issueId: z.string().nullable(),
    runtimeSessionId: z.string().nullable(),
    attemptCount: z.number().int().positive(),
    deadLetterId: z.string().nullable(),
    failureReason: z.string().nullable(),
    startedAt: z.string(),
    completedAt: z.string().nullable()
  }),
  fields: {
    routineId: { searchable: true, sortable: true, label: "Routine" },
    status: { filter: "select", label: "Status" },
    triggerSource: { filter: "select", label: "Source" },
    workflowState: { searchable: true, sortable: true, label: "Workflow" },
    inboxQueue: { searchable: true, sortable: true, label: "Inbox Queue" },
    startedAt: { sortable: true, label: "Started" }
  },
  admin: {
    autoCrud: true,
    defaultColumns: ["routineId", "status", "triggerSource", "workflowState", "issueId", "runtimeSessionId", "startedAt"]
  },
  portal: { enabled: false }
});

export const DeadLetterResource = defineResource({
  id: "automation.dead-letters",
  description: "Retry-exhausted or failed routine runs that require operator replay.",
  businessPurpose: "Give automation operators an explicit dead-letter queue instead of losing failed routine context in transient logs.",
  table: automationDeadLetters,
  contract: z.object({
    id: z.string().min(2),
    tenantId: z.string().min(2),
    routineId: z.string().min(2),
    runId: z.string().min(2),
    triggerSource: z.enum(["schedule", "api", "webhook"]),
    inboxQueue: z.string().min(2),
    issueSummary: z.string().nullable(),
    failureClass: z.enum(["dependency", "runtime", "notification", "policy", "orchestration"]),
    failureReason: z.string().min(2),
    status: z.enum(["open", "replayed", "resolved"]),
    attemptCount: z.number().int().positive(),
    replayRunId: z.string().nullable(),
    lastFailedAt: z.string(),
    lastReplayedAt: z.string().nullable()
  }),
  fields: {
    routineId: { searchable: true, sortable: true, label: "Routine" },
    failureClass: { filter: "select", label: "Failure Class" },
    status: { filter: "select", label: "Status" },
    inboxQueue: { searchable: true, sortable: true, label: "Queue" },
    attemptCount: { sortable: true, filter: "number", label: "Attempts" },
    lastFailedAt: { sortable: true, label: "Last Failed" }
  },
  admin: {
    autoCrud: true,
    defaultColumns: ["routineId", "failureClass", "status", "attemptCount", "inboxQueue", "lastFailedAt"]
  },
  portal: { enabled: false }
});

export const automationResources = [RoutineResource, RoutineRunResource, DeadLetterResource] as const;
