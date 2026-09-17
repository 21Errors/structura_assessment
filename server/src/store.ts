import type { ActionItem, CreateActionInput, UpdateActionInput } from "../../shared/actions";
import { cloneStarterActions } from "./data";

let actions = cloneStarterActions();
let nextIdNumber = actions.length + 1;

function nextId() {
  const id = `A${String(nextIdNumber).padStart(3, "0")}`;
  nextIdNumber += 1;
  return id;
}

export function resetActions() {
  actions = cloneStarterActions();
  nextIdNumber = actions.length + 1;
}

export function getActions() {
  return actions.map((action) => ({ ...action }));
}

export function createAction(input: CreateActionInput) {
  const action: ActionItem = {
    id: nextId(),
    ...input
  };
  actions = [action, ...actions];
  return { ...action };
}

export function updateAction(id: string, input: UpdateActionInput) {
  const action = actions.find((item) => item.id === id);

  if (!action) {
    return null;
  }

  action.status = input.status;
  return { ...action };
}

export function clearCompletedActions() {
  const beforeCount = actions.length;
  actions = actions.filter((action) => action.status !== "Completed");

  return {
    removed: beforeCount - actions.length,
    actions: getActions()
  };
}
