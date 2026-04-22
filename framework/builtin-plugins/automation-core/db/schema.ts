import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const automationRoutines = pgTable("automation_routines", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  label: text("label").notNull(),
  status: text("status").notNull(),
  trigger: text("trigger").notNull(),
  operationMode: text("operation_mode").notNull(),
  concurrencyPolicy: text("concurrency_policy").notNull(),
  catchUpPolicy: text("catch_up_policy").notNull(),
  workflowDefinitionKey: text("workflow_definition_key").notNull(),
  jobKey: text("job_key").notNull(),
  projectId: text("project_id"),
  runtimeId: text("runtime_id"),
  manualTriggerEnabled: text("manual_trigger_enabled").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const automationRoutineRuns = pgTable("automation_routine_runs", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  routineId: text("routine_id").notNull(),
  status: text("status").notNull(),
  triggerSource: text("trigger_source").notNull(),
  workflowState: text("workflow_state").notNull(),
  inboxQueue: text("inbox_queue").notNull(),
  notificationId: text("notification_id"),
  issueId: text("issue_id"),
  runtimeSessionId: text("runtime_session_id"),
  attemptCount: integer("attempt_count").notNull(),
  deadLetterId: text("dead_letter_id"),
  failureReason: text("failure_reason"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
});

export const automationDeadLetters = pgTable("automation_dead_letters", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  routineId: text("routine_id").notNull(),
  runId: text("run_id").notNull(),
  triggerSource: text("trigger_source").notNull(),
  inboxQueue: text("inbox_queue").notNull(),
  issueSummary: text("issue_summary"),
  failureClass: text("failure_class").notNull(),
  failureReason: text("failure_reason").notNull(),
  status: text("status").notNull(),
  attemptCount: integer("attempt_count").notNull(),
  replayRunId: text("replay_run_id"),
  lastFailedAt: timestamp("last_failed_at").notNull().defaultNow(),
  lastReplayedAt: timestamp("last_replayed_at")
});
