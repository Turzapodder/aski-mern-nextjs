import test from "node:test";
import assert from "node:assert/strict";

import { escapeRegex, safeSearchRegex } from "../utils/escapeRegex.js";

test("escapeRegex neutralizes every regex metacharacter", () => {
  const input = ".*+?^${}()|[]\\";
  const escaped = escapeRegex(input);
  assert.equal(new RegExp(`^${escaped}$`).test(input), true);
  assert.equal(new RegExp(`^${escaped}$`).test("something-else"), false);
});

test("safeSearchRegex matches the literal substring, not a pattern", () => {
  const rx = safeSearchRegex("a.c");
  assert.equal(rx.test("a.c"), true);
  assert.equal(rx.test("abc"), false);
});

test("safeSearchRegex defuses catastrophic-backtracking input in linear time", () => {
  const rx = safeSearchRegex("(a+)+$");
  const start = process.hrtime.bigint();
  const matched = rx.test(`${"a".repeat(50000)}b`);
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
  assert.equal(matched, false);
  assert.ok(elapsedMs < 100, `expected linear-time match, took ${elapsedMs}ms`);
  assert.equal(rx.test("(a+)+$"), true);
});

test("escapeRegex coerces non-string input safely", () => {
  assert.equal(escapeRegex(null), "");
  assert.equal(escapeRegex(undefined), "");
  assert.equal(escapeRegex(42), "42");
  assert.equal(escapeRegex({ $gt: "" }), escapeRegex("[object Object]"));
});
