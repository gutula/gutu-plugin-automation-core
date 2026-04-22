import React from "react";

import { getAutomationOverview, listRoutineRuns, listRoutines } from "../../services/main.service";

export function AutomationAdminPage() {
  const overview = getAutomationOverview();
  const routines = listRoutines().slice(0, 4);
  const runs = listRoutineRuns().slice(0, 4);

  return React.createElement(
    "section",
    null,
    React.createElement("h1", null, "Automation Control Room"),
    React.createElement(
      "p",
      null,
      `${overview.totals.activeRoutines} active routines and ${overview.totals.inboxItems} operator follow-up items.`
    ),
    React.createElement(
      "ul",
      null,
      ...routines.map((routine) =>
        React.createElement("li", { key: routine.id }, `${routine.label} - ${routine.trigger} - ${routine.concurrencyPolicy}`)
      )
    ),
    React.createElement("h2", null, "Recent Routine Runs"),
    React.createElement(
      "ul",
      null,
      ...runs.map((run) => React.createElement("li", { key: run.id }, `${run.routineId} - ${run.status} - ${run.workflowState}`))
    )
  );
}
