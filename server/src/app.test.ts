import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app";
import { resetActions } from "./store";

describe("actions API", () => {
  const app = createApp();

  beforeEach(() => {
    resetActions();
  });

  it("returns the starter action items", async () => {
    const response = await request(app).get("/api/actions").expect(200);

    expect(response.body.actions).toHaveLength(6);
    expect(response.body.actions[0]).toMatchObject({
      id: "A001",
      client: "Kopano School",
      priority: "High",
      status: "Open"
    });
  });

  it("rejects invalid action creation input with useful details", async () => {
    const response = await request(app)
      .post("/api/actions")
      .send({
        client: "",
        title: "Fix",
        owner: "",
        dueDate: "2026-02-30",
        priority: "Urgent",
        status: "Open"
      })
      .expect(400);

    expect(response.body.error).toBe("Invalid action item");
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "client" }),
        expect.objectContaining({ field: "title" }),
        expect.objectContaining({ field: "owner" }),
        expect.objectContaining({ field: "dueDate" }),
        expect.objectContaining({ field: "priority" })
      ])
    );
  });

  it("updates an action status and returns 404 for an unknown action", async () => {
    const updateResponse = await request(app)
      .patch("/api/actions/A001")
      .send({ status: "Completed" })
      .expect(200);

    expect(updateResponse.body.action).toMatchObject({
      id: "A001",
      status: "Completed"
    });

    await request(app).patch("/api/actions/UNKNOWN").send({ status: "Open" }).expect(404);
  });

  it("clears completed actions", async () => {
    const response = await request(app).delete("/api/actions/completed").expect(200);

    expect(response.body.removed).toBe(1);
    expect(response.body.actions).toHaveLength(5);
    expect(response.body.actions.every((action: { status: string }) => action.status !== "Completed")).toBe(true);
  });
});
