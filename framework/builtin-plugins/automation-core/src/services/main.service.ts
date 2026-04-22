import { loadJsonState, updateJsonState } from "@platform/ai-runtime";
import { normalizeActionInput } from "@platform/schema";
import { createIssue } from "@plugins/issues-core";
import { scheduleJobExecution } from "@plugins/jobs-core";
import { queueNotificationMessage } from "@plugins/notifications-core";
import { prepareRuntimeSession } from "@plugins/runtime-bridge-core";
import { transitionWorkflowInstance } from "@plugins/workflow-core";

export type AutomationRoutine = {
  id: string;
  tenantId: string;
  label: string;
  status: "draft" | "active" | "paused";
  trigger: "schedule" | "api" | "webhook";
  operationMode: "follow-up" | "run-only" | "issue-drive";
  concurrencyPolicy: "queue" | "drop" | "replace";
  catchUpPolicy: "skip" | "replay-missed" | "collapse";
  workflowDefinitionKey: "company-work-intake" | "ai-run-lifecycle";
  jobKey: "company.work-intakes.classify" | "ai.runs.intake" | "workflow.approvals.remind";
  projectId: string | null;
  runtimeId: string | null;
  issueTitleTemplate: string | null;
  manualTriggerEnabled: boolean;
  triggerRoute: string | null;
  scheduleExpression: string | null;
  updatedAt: string;
};

export type AutomationRoutineRun = {
  id: string;
  tenantId: string;
  routineId: string;
  status: "queued" | "running" | "waiting-human" | "completed" | "failed" | "escalated";
  triggerSource: "schedule" | "api" | "webhook";
  workflowState: string;
  inboxQueue: string;
  notificationId: string | null;
  issueId: string | null;
  runtimeSessionId: string | null;
  attemptCount: number;
  deadLetterId: string | null;
  failureReason: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type AutomationDeadLetter = {
  id: string;
  tenantId: string;
  routineId: string;
  runId: string;
  triggerSource: AutomationRoutineRun["triggerSource"];
  inboxQueue: string;
  issueSummary: string | null;
  failureClass: "dependency" | "runtime" | "notification" | "policy" | "orchestration";
  failureReason: string;
  status: "open" | "replayed" | "resolved";
  attemptCount: number;
  replayRunId: string | null;
  lastFailedAt: string;
  lastReplayedAt: string | null;
};

type AutomationState = {
  routines: AutomationRoutine[];
  routineRuns: AutomationRoutineRun[];
  deadLetters: AutomationDeadLetter[];
};

export type CreateRoutineInput = {
  tenantId: string;
  actorId: string;
  routineId: string;
  label: string;
  trigger: AutomationRoutine["trigger"];
  operationMode?: AutomationRoutine["operationMode"] | undefined;
  concurrencyPolicy: AutomationRoutine["concurrencyPolicy"];
  catchUpPolicy: AutomationRoutine["catchUpPolicy"];
  workflowDefinitionKey: AutomationRoutine["workflowDefinitionKey"];
  jobKey: AutomationRoutine["jobKey"];
  projectId?: string | undefined;
  runtimeId?: string | undefined;
  issueTitleTemplate?: string | undefined;
  manualTriggerEnabled?: boolean | undefined;
  triggerRoute?: string | undefined;
  scheduleExpression?: string | undefined;
};

export type UpdateRoutineInput = {
  tenantId: string;
  actorId: string;
  routineId: string;
  status: AutomationRoutine["status"];
  operationMode?: AutomationRoutine["operationMode"] | undefined;
  concurrencyPolicy?: AutomationRoutine["concurrencyPolicy"] | undefined;
  catchUpPolicy?: AutomationRoutine["catchUpPolicy"] | undefined;
  scheduleExpression?: string | undefined;
  projectId?: string | undefined;
  runtimeId?: string | undefined;
  manualTriggerEnabled?: boolean | undefined;
};

export type TriggerRoutineInput = {
  tenantId: string;
  actorId: string;
  routineId: string;
  triggerSource: AutomationRoutineRun["triggerSource"];
  queue: string;
  issueSummary?: string | undefined;
  manualTrigger?: boolean | undefined;
};

export type ReplayDeadLetterInput = {
  tenantId: string;
  actorId: string;
  deadLetterId: string;
};

const automationStateFile = "automation-core.json";

function seedAutomationState(): AutomationState {
  return {
    routines: [
      {
        id: "routine:daily-ops-handoff",
        tenantId: "tenant-platform",
        label: "Daily Ops Handoff",
        status: "active",
        trigger: "schedule",
        operationMode: "issue-drive",
        concurrencyPolicy: "queue",
        catchUpPolicy: "collapse",
        workflowDefinitionKey: "company-work-intake",
        jobKey: "company.work-intakes.classify",
        projectId: "project:pack0-ops",
        runtimeId: "runtime:local-dev",
        issueTitleTemplate: "Daily Ops Handoff",
        manualTriggerEnabled: true,
        triggerRoute: null,
        scheduleExpression: "weekday-0900",
        updatedAt: "2026-04-22T12:30:00.000Z"
      }
    ],
    routineRuns: [],
    deadLetters: []
  };
}

function loadAutomationState(): AutomationState {
  return updateAutomationState(loadJsonState(automationStateFile, seedAutomationState));
}

function persistAutomationState(updater: (state: AutomationState) => AutomationState): AutomationState {
  return updateAutomationState(updateJsonState(automationStateFile, seedAutomationState, updater));
}

export function listRoutines(): AutomationRoutine[] {
  return loadAutomationState().routines.sort((left, right) => left.label.localeCompare(right.label));
}

export function listRoutineRuns(): AutomationRoutineRun[] {
  return loadAutomationState().routineRuns.sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

export function listAutomationDeadLetters(): AutomationDeadLetter[] {
  return loadAutomationState().deadLetters.sort((left, right) => right.lastFailedAt.localeCompare(left.lastFailedAt));
}

export function getAutomationOverview() {
  const state = loadAutomationState();
  return {
    totals: {
      routines: state.routines.length,
      activeRoutines: state.routines.filter((routine) => routine.status === "active").length,
      inboxItems: state.routineRuns.filter((run) => run.status === "waiting-human" || run.status === "escalated").length,
      autopilotRuns: state.routineRuns.filter((run) => run.issueId !== null || run.runtimeSessionId !== null).length,
      deadLetters: state.deadLetters.filter((deadLetter) => deadLetter.status === "open").length
    }
  };
}

export function createRoutine(input: CreateRoutineInput) {
  normalizeActionInput(input);
  persistAutomationState((state) => ({
    ...state,
    routines: upsertById(state.routines, {
      id: input.routineId,
      tenantId: input.tenantId,
      label: input.label,
      status: "active",
      trigger: input.trigger,
      operationMode: input.operationMode ?? "follow-up",
      concurrencyPolicy: input.concurrencyPolicy,
      catchUpPolicy: input.catchUpPolicy,
      workflowDefinitionKey: input.workflowDefinitionKey,
      jobKey: input.jobKey,
      projectId: input.projectId ?? null,
      runtimeId: input.runtimeId ?? null,
      issueTitleTemplate: input.issueTitleTemplate ?? null,
      manualTriggerEnabled: input.manualTriggerEnabled ?? true,
      triggerRoute: input.triggerRoute ?? null,
      scheduleExpression: input.scheduleExpression ?? null,
      updatedAt: new Date().toISOString()
    })
  }));

  return {
    ok: true as const,
    routineId: input.routineId,
    status: "active" as const
  };
}

export function updateRoutine(input: UpdateRoutineInput) {
  normalizeActionInput(input);
  persistAutomationState((state) => {
    const existing = state.routines.find((routine) => routine.id === input.routineId && routine.tenantId === input.tenantId);
    if (!existing) {
      throw new Error(`Unknown routine '${input.routineId}'.`);
    }

    return {
      ...state,
      routines: upsertById(state.routines, {
        ...existing,
        status: input.status,
        operationMode: input.operationMode ?? existing.operationMode,
        concurrencyPolicy: input.concurrencyPolicy ?? existing.concurrencyPolicy,
        catchUpPolicy: input.catchUpPolicy ?? existing.catchUpPolicy,
        scheduleExpression: input.scheduleExpression ?? existing.scheduleExpression,
        projectId: input.projectId ?? existing.projectId,
        runtimeId: input.runtimeId ?? existing.runtimeId,
        manualTriggerEnabled: input.manualTriggerEnabled ?? existing.manualTriggerEnabled,
        updatedAt: new Date().toISOString()
      })
    };
  });

  return {
    ok: true as const,
    routineId: input.routineId,
    status: input.status
  };
}

export function triggerRoutine(input: TriggerRoutineInput) {
  normalizeActionInput(input);
  const state = loadAutomationState();
  const routine = state.routines.find((entry) => entry.id === input.routineId && entry.tenantId === input.tenantId);
  if (!routine) {
    throw new Error(`Unknown routine '${input.routineId}'.`);
  }
  if (routine.status !== "active") {
    throw new Error(`Routine '${input.routineId}' is not active.`);
  }
  if (input.manualTrigger && !routine.manualTriggerEnabled) {
    throw new Error(`Routine '${input.routineId}' does not allow manual triggers.`);
  }

  const existingActive = state.routineRuns.find(
    (run) => run.routineId === input.routineId && (run.status === "queued" || run.status === "running" || run.status === "waiting-human")
  );
  if (existingActive && routine.concurrencyPolicy === "drop") {
    return {
      ok: true as const,
      runId: existingActive.id,
      status: existingActive.status,
      dropped: true,
      issueId: existingActive.issueId,
      runtimeSessionId: existingActive.runtimeSessionId,
      deadLetterId: existingActive.deadLetterId
    };
  }

  return executeRoutineRun(routine, {
    tenantId: input.tenantId,
    actorId: input.actorId,
    triggerSource: input.triggerSource,
    queue: input.queue,
    issueSummary: input.issueSummary ?? null,
    attemptCount: 1,
    replaceExisting: routine.concurrencyPolicy === "replace"
  });
}

export function replayAutomationDeadLetter(input: ReplayDeadLetterInput) {
  normalizeActionInput(input);
  const state = loadAutomationState();
  const deadLetter = state.deadLetters.find((entry) => entry.id === input.deadLetterId && entry.tenantId === input.tenantId);
  if (!deadLetter) {
    throw new Error(`Unknown dead letter '${input.deadLetterId}'.`);
  }
  const routine = state.routines.find((entry) => entry.id === deadLetter.routineId && entry.tenantId === input.tenantId);
  if (!routine) {
    throw new Error(`Dead letter '${input.deadLetterId}' references an unknown routine.`);
  }
  if (routine.status !== "active") {
    throw new Error(`Routine '${routine.id}' is not active.`);
  }

  const replay = executeRoutineRun(routine, {
    tenantId: input.tenantId,
    actorId: input.actorId,
    triggerSource: deadLetter.triggerSource,
    queue: deadLetter.inboxQueue,
    issueSummary: deadLetter.issueSummary,
    attemptCount: deadLetter.attemptCount + 1,
    replaceExisting: false
  });

  persistAutomationState((currentState) => ({
    ...currentState,
    deadLetters: upsertById(currentState.deadLetters, {
      ...deadLetter,
      status: replay.status === "failed" ? "open" : "replayed",
      attemptCount: deadLetter.attemptCount + (replay.status === "failed" ? 1 : 0),
      replayRunId: replay.runId,
      lastReplayedAt: new Date().toISOString()
    })
  }));

  return {
    ok: true as const,
    deadLetterId: input.deadLetterId,
    replayRunId: replay.runId,
    status: replay.status
  };
}

function executeRoutineRun(
  routine: AutomationRoutine,
  input: {
    tenantId: string;
    actorId: string;
    triggerSource: AutomationRoutineRun["triggerSource"];
    queue: string;
    issueSummary: string | null;
    attemptCount: number;
    replaceExisting: boolean;
  }
) {
  const startedAt = new Date().toISOString();
  const runId = `routine-run:${routine.id}:${Date.now()}`;

  try {
    const workflowTransition = transitionWorkflowInstance({
      tenantId: input.tenantId,
      instanceId: runId,
      definitionKey: routine.workflowDefinitionKey,
      currentState: "intake",
      transition: "classify",
      actorRole: "system"
    });
    const jobExecution = scheduleJobExecution({
      executionId: runId,
      tenantId: input.tenantId,
      jobKey: routine.jobKey,
      concurrency: 1,
      retries: 1,
      timeoutMs: routine.jobKey === "workflow.approvals.remind" ? 45_000 : 60_000
    });
    const issueId =
      routine.operationMode !== "run-only" && routine.projectId
        ? createIssue({
            tenantId: input.tenantId,
            actorId: input.actorId,
            issueId: `issue:${runId}`,
            projectId: routine.projectId,
            title: routine.issueTitleTemplate ?? `${routine.label} trigger`,
            summary: input.issueSummary ?? `${routine.label} triggered via ${input.triggerSource}.`,
            priority: routine.jobKey === "workflow.approvals.remind" ? "high" : "medium",
            queue: input.queue,
            reporterKind: "user",
            reporterId: input.actorId,
            status: routine.jobKey === "workflow.approvals.remind" ? "waiting-human" : "open"
          }).issueId
        : null;
    const runtimeSessionId =
      routine.runtimeId !== null
        ? prepareRuntimeSession({
            tenantId: input.tenantId,
            actorId: input.actorId,
            sessionRecordId: `runtime-session:${runId}`,
            runtimeId: routine.runtimeId,
            issueId: issueId ?? undefined,
            sessionId: `session:${runId}`,
            workDir: `/automation/${runId}`,
            checkpointId: routine.jobKey === "workflow.approvals.remind" ? `checkpoint:${runId}` : undefined
          }).sessionRecordId
        : null;
    const waitingHuman = routine.trigger === "webhook" || routine.jobKey === "workflow.approvals.remind" || issueId !== null;
    const notification = queueNotificationMessage({
      messageId: `message:${runId}`,
      tenantId: input.tenantId,
      actorId: input.actorId,
      channel: "in-app",
      recipientRef: input.queue,
      directAddress: "/admin/automation",
      title: waitingHuman ? "Routine waiting for operator input" : "Routine triggered",
      bodyText: `${routine.label} entered ${workflowTransition.nextState} via ${input.triggerSource}.`,
      deliveryMode: "immediate",
      priority: waitingHuman ? "high" : "normal",
      idempotencyKey: `${runId}:notify`
    });
    const status: AutomationRoutineRun["status"] =
      waitingHuman ? "waiting-human" : jobExecution.nextStatus === "scheduled" ? "queued" : "completed";
    const completedAt = status === "completed" ? new Date().toISOString() : null;
    persistAutomationState((currentState) => ({
      ...currentState,
      routineRuns: [
        ...currentState.routineRuns.filter((run) => !(run.routineId === routine.id && input.replaceExisting)),
        {
          id: runId,
          tenantId: input.tenantId,
          routineId: routine.id,
          status,
          triggerSource: input.triggerSource,
          workflowState: workflowTransition.nextState,
          inboxQueue: input.queue,
          notificationId: notification.message.id,
          issueId,
          runtimeSessionId,
          attemptCount: input.attemptCount,
          deadLetterId: null,
          failureReason: null,
          startedAt,
          completedAt
        }
      ]
    }));

    return {
      ok: true as const,
      runId,
      status,
      dropped: false,
      issueId,
      runtimeSessionId,
      deadLetterId: null as string | null
    };
  } catch (error) {
    const completedAt = new Date().toISOString();
    const failureReason = error instanceof Error ? error.message : String(error);
    const deadLetterId = `dead-letter:${runId}`;
    const failureClass = classifyDeadLetterFailure(failureReason);
    queueNotificationMessage({
      messageId: `message:${deadLetterId}`,
      tenantId: input.tenantId,
      actorId: input.actorId,
      channel: "in-app",
      recipientRef: input.queue,
      directAddress: "/admin/automation/inbox",
      title: "Routine moved to dead letter",
      bodyText: `${routine.label} failed: ${failureReason}`,
      deliveryMode: "immediate",
      priority: "critical",
      idempotencyKey: `${deadLetterId}:notify`
    });
    persistAutomationState((currentState) => ({
      ...currentState,
      routineRuns: [
        ...currentState.routineRuns.filter((run) => !(run.routineId === routine.id && input.replaceExisting)),
        {
          id: runId,
          tenantId: input.tenantId,
          routineId: routine.id,
          status: "failed",
          triggerSource: input.triggerSource,
          workflowState: "dead-letter",
          inboxQueue: input.queue,
          notificationId: `message:${deadLetterId}`,
          issueId: null,
          runtimeSessionId: null,
          attemptCount: input.attemptCount,
          deadLetterId,
          failureReason,
          startedAt,
          completedAt
        }
      ],
      deadLetters: upsertById(currentState.deadLetters, {
        id: deadLetterId,
        tenantId: input.tenantId,
        routineId: routine.id,
        runId,
        triggerSource: input.triggerSource,
        inboxQueue: input.queue,
        issueSummary: input.issueSummary,
        failureClass,
        failureReason,
        status: "open",
        attemptCount: input.attemptCount,
        replayRunId: null,
        lastFailedAt: completedAt,
        lastReplayedAt: null
      })
    }));

    return {
      ok: true as const,
      runId,
      status: "failed" as const,
      dropped: false,
      issueId: null,
      runtimeSessionId: null,
      deadLetterId
    };
  }
}

function classifyDeadLetterFailure(failureReason: string): AutomationDeadLetter["failureClass"] {
  if (failureReason.includes("Unknown project")) {
    return "dependency";
  }
  if (failureReason.includes("Unknown runtime")) {
    return "runtime";
  }
  if (failureReason.includes("allow")) {
    return "policy";
  }
  if (failureReason.includes("notify")) {
    return "notification";
  }
  return "orchestration";
}

function updateAutomationState(state: AutomationState): AutomationState {
  return {
    routines: state.routines.map((routine) => ({
      ...routine
    })),
    routineRuns: state.routineRuns.map((run) => ({
      ...run
    })),
    deadLetters: (state.deadLetters ?? []).map((deadLetter) => ({
      ...deadLetter
    }))
  };
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const remaining = items.filter((entry) => entry.id !== item.id);
  return [...remaining, item];
}
