import path from "node:path";
import { existsSync } from "node:fs";
import express from "express";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

const clientDist = path.resolve(process.cwd(), "dist/client");

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Structura Action Tracker API running on http://localhost:${port}`);
});
