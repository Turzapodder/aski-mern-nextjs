import test from "node:test";
import assert from "node:assert/strict";

import { requireSuperAdmin, requirePrivilege } from "../middlewares/admin-middleware.js";

const invoke = (mw, user) => {
  let nexted = false;
  let status = 0;
  const req = { user };
  const res = {
    status: (code) => {
      status = code;
      return res;
    },
    json: () => res,
  };
  mw(req, res, () => {
    nexted = true;
  });
  return { nexted, status };
};

test("requireSuperAdmin allows only super_admin", () => {
  assert.equal(invoke(requireSuperAdmin, { adminRole: "super_admin" }).nexted, true);
  assert.equal(invoke(requireSuperAdmin, { adminRole: "admin" }).status, 403);
  assert.equal(invoke(requireSuperAdmin, { adminRole: "moderator" }).status, 403);
  assert.equal(invoke(requireSuperAdmin, {}).status, 403);
});

test("requirePrivilege allows super_admin and the granted privilege, denies others", () => {
  const mw = requirePrivilege("canManagePayments");
  assert.equal(invoke(mw, { adminRole: "super_admin" }).nexted, true);
  assert.equal(invoke(mw, { adminRole: "admin", adminPrivileges: { canManagePayments: true } }).nexted, true);
  assert.equal(invoke(mw, { adminRole: "moderator", adminPrivileges: { canManagePayments: false } }).status, 403);
  assert.equal(invoke(mw, { adminRole: "admin", adminPrivileges: {} }).status, 403);
  assert.equal(invoke(mw, {}).status, 403);
});
