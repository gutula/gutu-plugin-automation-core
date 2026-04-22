import { defineAction } from "@platform/schema";
import { z } from "zod";

import { createRoutine, replayAutomationDeadLetter, triggerRoutine, updateRoutine } from "../services/main.service";

export const createRoutineAction = defineAction({
  id: "automation.routines.create",
  input: z.object({
    tenantId: z.string().min(2),
    actorId: z.string().min(2),
    routineId: z.string().min(2),
    label: z.string().min(2),
    trigger: z.enum(["schedule", "api", "webhook"]),
    operationMode: z.enum(["follow-up", "run-only", "issue-drive"]).optional(),
    concurrencyPolicy: z.enum(["queue", "drop", "replace"]),
    catchUpPolicy: z.enum(["skip", "replay-missed", "collapse"]),
    workflowDefinitionKey: z.enum(["company-work-intake", "ai-run-lifecycle"]),
    jobKey: z.enum(["company.work-intakes.classify", "ai.runs.intake", "workflow.approvals.remind"]),
    projectId: z.string().min(2).optional(),
    runtimeId: z.string().min(2).optional(),
    issueTitleTemplate: z.string().min(2).optional(),
    manualTriggerEnabled: z.boolean().optional(),
    triggerRoute: z.string().min(2).optional(),
    scheduleExpression: z.string().min(2).optional()
  }),
  output: z.object({
    ok: z.literal(true),
    routineId: z.string(),
    status: z.literal("active")
  }),
  permission: "automation.routines.create",
  idempotent: true,
  audit: true,
  handler: ({ input }) => createRoutine(input)
});

export const updateRoutineAction = defineAction({
  id: "automation.routines.update",
  input: z.object({
    tenantId: z.string().min(2),
    actorId: z.string().min(2),
    routineId: z.string().min(2),
    status: z.enum(["draft", "active", "paused"]),
    operationMode: z.enum(["follow-up", "run-only", "issue-drive"]).optional(),
    concurrencyPolicy: z.enum(["queue", "drop", "replace"]).optional(),
    catchUpPolicy: z.enum(["skip", "replay-missed", "collapse"]).optional(),
    scheduleExpression: z.string().min(2).optional(),
    projectId: z.string().min(2).optional(),
    runtimeId: z.string().min(2).optional(),
    manualTriggerEnabled: z.boolean().optional()
  }),
  output: z.object({
    ok: z.literal(true),
    routineId: z.string(),
    status: z.enum(["draft", "active", "paused"])
  }),
  permission: "automation.routines.update",
  idempotent: true,
  audit: true,
  handler: ({ input }) => updateRoutine(input)
});

export const triggerRoutineAction = defineAction({
  id: "automation.routines.trigger",
  input: z.object({
    tenantId: z.string().min(2),
    actorId: z.string().min(2),
    routineId: z.string().min(2),
    triggerSource: z.enum(["schedule", "api", "webhook"]),
    queue: z.string().min(2),
    issueSummary: z.string().min(2).optional(),
    manualTrigger: z.boolean().optional()
  }),
  output: z.object({
    ok: z.literal(true),
    runId: z.string(),
    status: z.enum(["queued", "running", "waiting-human", "completed", "failed", "escalated"]),
    dropped: z.boolean(),
    issueId: z.string().nullable(),
    runtimeSessionId: z.string().nullable(),
    deadLetterId: z.string().nullable()
  }),
  permission: "automation.routines.trigger",
  idempotent: false,
  audit: true,
  handler: ({ input }) => triggerRoutine(input)
});

export const replayAutomationDeadLetterAction = defineAction({
  id: "automation.dead-letters.replay",
  input: z.object({
    tenantId: z.string().min(2),
    actorId: z.string().min(2),
    deadLetterId: z.string().min(2)
  }),
  output: z.object({
    ok: z.literal(true),
    deadLetterId: z.string(),
    replayRunId: z.string(),
    status: z.enum(["queued", "running", "waiting-human", "completed", "failed", "escalated"])
  }),
  permission: "automation.dead-letters.replay",
  idempotent: false,
  audit: true,
  handler: ({ input }) => replayAutomationDeadLetter(input)
});

export const automationActions = [createRoutineAction, updateRoutineAction, triggerRoutineAction, replayAutomationDeadLetterAction] as const;
