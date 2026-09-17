import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { createActionSchema, updateActionSchema } from "../../shared/actions";
import { clearCompletedActions, createAction, getActions, updateAction } from "./store";

function formatValidationError(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message
  }));
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/actions", (_request, response) => {
    response.json({ actions: getActions() });
  });

  app.post("/api/actions", (request, response) => {
    const parsed = createActionSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        error: "Invalid action item",
        details: formatValidationError(parsed.error)
      });
      return;
    }

    const action = createAction(parsed.data);
    response.status(201).json({ action });
  });

  app.patch("/api/actions/:id", (request, response) => {
    const parsed = updateActionSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        error: "Invalid action update",
        details: formatValidationError(parsed.error)
      });
      return;
    }

    const action = updateAction(request.params.id, parsed.data);

    if (!action) {
      response.status(404).json({ error: "Action item not found" });
      return;
    }

    response.json({ action });
  });

  app.delete("/api/actions/completed", (_request, response) => {
    const result = clearCompletedActions();
    response.json(result);
  });

  return app;
}
