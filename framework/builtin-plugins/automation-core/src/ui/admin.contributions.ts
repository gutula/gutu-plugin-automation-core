import {
  defineAdminNav,
  defineCommand,
  definePage,
  defineWorkspace,
  type AdminContributionRegistry
} from "@platform/admin-contracts";

import { AutomationInboxPage } from "./admin/inbox.page";
import { AutomationAdminPage } from "./admin/main.page";

export const adminContributions: Pick<AdminContributionRegistry, "workspaces" | "nav" | "pages" | "commands"> = {
  workspaces: [
    defineWorkspace({
      id: "automation",
      label: "Automation",
      icon: "repeat",
      description: "Governed routines, queue posture, and operator follow-up loops.",
      permission: "automation.routines.read",
      homePath: "/admin/automation",
      quickActions: ["automation.open.control-room", "automation.open.inbox"]
    })
  ],
  nav: [
    defineAdminNav({
      workspace: "automation",
      group: "control-room",
      items: [
        {
          id: "automation.overview",
          label: "Control Room",
          icon: "timer-reset",
          to: "/admin/automation",
          permission: "automation.routines.read"
        },
        {
          id: "automation.inbox",
          label: "Operator Inbox",
          icon: "inbox",
          to: "/admin/automation/inbox",
          permission: "automation.routines.read"
        }
      ]
    })
  ],
  pages: [
    definePage({
      id: "automation.page",
      kind: "dashboard",
      route: "/admin/automation",
      label: "Automation Control Room",
      workspace: "automation",
      group: "control-room",
      permission: "automation.routines.read",
      component: AutomationAdminPage
    }),
    definePage({
      id: "automation.inbox.page",
      kind: "queue",
      route: "/admin/automation/inbox",
      label: "Operator Inbox",
      workspace: "automation",
      group: "control-room",
      permission: "automation.routines.read",
      component: AutomationInboxPage
    })
  ],
  commands: [
    defineCommand({
      id: "automation.open.control-room",
      label: "Open Automation Control Room",
      permission: "automation.routines.read",
      href: "/admin/automation",
      keywords: ["automation", "routines", "control"]
    }),
    defineCommand({
      id: "automation.open.inbox",
      label: "Open Automation Inbox",
      permission: "automation.routines.read",
      href: "/admin/automation/inbox",
      keywords: ["automation", "inbox", "follow-up"]
    })
  ]
};
