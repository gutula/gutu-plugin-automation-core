export { DeadLetterResource, RoutineResource, RoutineRunResource, automationResources } from "./resources/main.resource";
export { createRoutineAction, replayAutomationDeadLetterAction, updateRoutineAction, triggerRoutineAction, automationActions } from "./actions/default.action";
export { automationPolicy } from "./policies/default.policy";
export {
  listAutomationDeadLetters,
  listRoutines,
  listRoutineRuns,
  getAutomationOverview,
  createRoutine,
  replayAutomationDeadLetter,
  updateRoutine,
  triggerRoutine
} from "./services/main.service";
export { adminContributions } from "./ui/admin.contributions";
export { uiSurface } from "./ui/surfaces";
export { default as manifest } from "../package";
