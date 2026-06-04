import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

if (!process.env.JWT_ACCESS_TOKEN_SECRET_KEY) {
  process.env.JWT_ACCESS_TOKEN_SECRET_KEY = "test-access-secret";
}
if (!process.env.JWT_REFRESH_TOKEN_SECRET_KEY) {
  process.env.JWT_REFRESH_TOKEN_SECRET_KEY = "test-refresh-secret";
}

const { extractSocketToken, verifyAccessSocketToken } = await import("../config/socket.js");

const accessSecret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;

test("extractSocketToken prefers auth.token then header then accessToken cookie, ignoring refreshToken", () => {
  assert.equal(
    extractSocketToken({ authToken: "A", authorizationHeader: "Bearer B", cookieHeader: "accessToken=C" }),
    "A"
  );
  assert.equal(extractSocketToken({ authorizationHeader: "Bearer B", cookieHeader: "accessToken=C" }), "B");
  assert.equal(extractSocketToken({ cookieHeader: "accessToken=C; refreshToken=D" }), "C");
  assert.equal(extractSocketToken({ cookieHeader: "refreshToken=D" }), "", "refresh cookie must not be accepted");
  assert.equal(extractSocketToken({}), "");
  assert.equal(extractSocketToken(), "");
});

test("verifyAccessSocketToken accepts only HS256 tokens signed with the access secret", () => {
  const valid = jwt.sign({ _id: "u1", roles: ["user"] }, accessSecret, { expiresIn: "5m" });
  assert.equal(verifyAccessSocketToken(valid)?._id, "u1");

  const wrongSecret = jwt.sign({ _id: "u1" }, `${accessSecret}_WRONG`, { expiresIn: "5m" });
  assert.equal(verifyAccessSocketToken(wrongSecret), null, "token signed with a different secret must be rejected");

  const wrongAlg = jwt.sign({ _id: "u1" }, accessSecret, { algorithm: "HS384", expiresIn: "5m" });
  assert.equal(verifyAccessSocketToken(wrongAlg), null, "non-HS256 algorithm must be rejected");

  const expired = jwt.sign({ _id: "u1" }, accessSecret, { expiresIn: -10 });
  assert.equal(verifyAccessSocketToken(expired), null, "expired token must be rejected");

  assert.equal(verifyAccessSocketToken("garbage"), null);
  assert.equal(verifyAccessSocketToken(""), null);
});
