import { definePolicy } from "@platform/permissions";

export const automationPolicy = definePolicy({
  id: "automation-core.default",
  rules: [
    {
      permission: "automation.routines.read",
      allowIf: ["role:admin", "role:operator", "role:support"]
    },
    {
      permission: "automation.routines.create",
      allowIf: ["role:admin", "role:operator"],
      requireReason: true,
      audit: true
    },
    {
      permission: "automation.routines.update",
      allowIf: ["role:admin", "role:operator"],
      requireReason: true,
      audit: true
    },
    {
      permission: "automation.routines.trigger",
      allowIf: ["role:admin", "role:operator"],
      requireReason: true,
      audit: true
    }
  ]
});
