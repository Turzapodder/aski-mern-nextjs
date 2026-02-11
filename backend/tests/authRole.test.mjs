import test from "node:test";
import assert from "node:assert/strict";

import {
  canUserUseLoginRole,
  normalizeLoginRole,
  normalizeUserRoles,
} from "../utils/authRole.js";

test("normalizeLoginRole maps supported values", () => {
  assert.equal(normalizeLoginRole("USER"), "user");
  assert.equal(normalizeLoginRole("student"), "user");
  assert.equal(normalizeLoginRole("tutor"), "tutor");
  assert.equal(normalizeLoginRole("admin"), "admin");
  assert.equal(normalizeLoginRole("unknown"), null);
  assert.equal(normalizeLoginRole(""), null);
});

test("normalizeUserRoles returns safe array", () => {
  assert.deepEqual(normalizeUserRoles(["admin", " tutor ", 1]), ["admin", "tutor"]);
  assert.deepEqual(normalizeUserRoles(null), []);
});

test("admin accounts can only use admin login", () => {
  assert.equal(canUserUseLoginRole(["admin"], "admin"), true);
  assert.equal(canUserUseLoginRole(["admin", "tutor"], "tutor"), false);
  assert.equal(canUserUseLoginRole(["admin", "user"], "user"), false);
});

test("non-admin roles map correctly", () => {
  assert.equal(canUserUseLoginRole(["user"], "user"), true);
  assert.equal(canUserUseLoginRole(["student"], "user"), true);
  assert.equal(canUserUseLoginRole(["tutor"], "tutor"), true);
  assert.equal(canUserUseLoginRole(["tutor"], "user"), false);
  assert.equal(canUserUseLoginRole(["user"], "admin"), false);
});
