import { defineUiSurface } from "@platform/ui-shell";

import { AutomationAdminPage } from "./admin/main.page";

export const uiSurface = defineUiSurface({
  embeddedPages: [
    {
      shell: "admin",
      route: "/admin/automation",
      component: AutomationAdminPage,
      permission: "automation.routines.read"
    }
  ],
  widgets: []
});
