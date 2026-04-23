import { definePackage } from "@platform/kernel";

export default definePackage({
  id: "automation-core",
  kind: "plugin",
  version: "0.1.0",
  displayName: "Automation Core",
  defaultCategory: {
    id: "platform_governance",
    label: "Platform Governance",
    subcategoryId: "automation",
    subcategoryLabel: "Automation"
  },
  description: "Scheduled, API, and webhook-triggered routines with governed concurrency, catch-up policy, and operator follow-up loops.",
  extends: [],
  dependsOn: [
    "auth-core",
    "org-tenant-core",
    "role-policy-core",
    "audit-core",
    "jobs-core",
    "issues-core",
    "workflow-core",
    "notifications-core",
    "runtime-bridge-core"
  ],
  optionalWith: [],
  conflictsWith: [],
  providesCapabilities: ["automation.routines", "automation.routine-runs"],
  requestedCapabilities: [
    "ui.register.admin",
    "api.rest.mount",
    "data.write.automation",
    "jobs.execute.ai",
    "workflow.execute.ai",
    "notifications.enqueue.ai"
  ],
  ownsData: ["automation.routines", "automation.routine-runs"],
  extendsData: [],
  slotClaims: [],
  trustTier: "first-party",
  reviewTier: "R1",
  isolationProfile: "same-process-trusted",
  compatibility: {
    framework: "^0.1.0",
    runtime: "bun>=1.3.12",
    db: ["postgres", "sqlite"]
  }
});
