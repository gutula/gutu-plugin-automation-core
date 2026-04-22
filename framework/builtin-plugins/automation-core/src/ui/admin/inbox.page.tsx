import React from "react";

import { listRoutineRuns } from "../../services/main.service";

export function AutomationInboxPage() {
  const waitingRuns = listRoutineRuns().filter((run) => run.status === "waiting-human" || run.status === "escalated");
  return React.createElement(
    "section",
    null,
    React.createElement("h1", null, "Operator Inbox"),
    React.createElement(
      "ul",
      null,
      ...waitingRuns.map((run) => React.createElement("li", { key: run.id }, `${run.inboxQueue} - ${run.status} - ${run.routineId}`))
    )
  );
}
