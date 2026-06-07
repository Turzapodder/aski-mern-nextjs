import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

import { quizLimiter } from "../middlewares/rateLimiters.js";

const startServer = (limiter) =>
  new Promise((resolve) => {
    const app = express();
    app.get("/x", limiter, (req, res) => res.json({ ok: true }));
    const server = app.listen(0, () => resolve(server));
  });

test("quizLimiter allows up to the cap then returns 429", async () => {
  const server = await startServer(quizLimiter);
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/x`;
  try {
    const statuses = [];
    for (let i = 0; i < 6; i += 1) {
      const res = await fetch(url);
      statuses.push(res.status);
    }
    const okCount = statuses.filter((s) => s === 200).length;
    const limitedCount = statuses.filter((s) => s === 429).length;
    assert.equal(okCount, 5, "first 5 requests should pass the limiter");
    assert.ok(limitedCount >= 1, "requests beyond the cap should be rate limited");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
