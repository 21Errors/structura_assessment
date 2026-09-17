import type { ActionItem, CreateActionInput, Status } from "../../shared/actions";

type ActionsResponse = {
  actions: ActionItem[];
};

type ActionResponse = {
  action: ActionItem;
};

type ClearCompletedResponse = {
  actions: ActionItem[];
  removed: number;
};

async function request<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error ?? "Something went wrong";
    throw new Error(message);
  }

  return body as T;
}

export async function fetchActions() {
  const data = await request<ActionsResponse>("/api/actions");
  return data.actions;
}

export async function createAction(input: CreateActionInput) {
  const data = await request<ActionResponse>("/api/actions", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return data.action;
}

export async function updateActionStatus(id: string, status: Status) {
  const data = await request<ActionResponse>(`/api/actions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  return data.action;
}

export async function clearCompletedActions() {
  return request<ClearCompletedResponse>("/api/actions/completed", {
    method: "DELETE"
  });
}
