import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import generateTokens from "../utils/generateTokens.js";
import verifyRefreshToken from "../utils/verifyRefreshToken.js";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
import UserModel from "../models/User.js";

const databaseUrl = process.env.DATABASE_URL || "";

test(
  "generateTokens rotates refresh tokens: old purged and rejected, only newest valid",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    let connectedHere = false;
    let user;
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(databaseUrl, { dbName: "aski-db" });
        connectedHere = true;
      }

      user = await UserModel.create({
        name: `Rotate ${seed}`,
        email: `rotate-${seed}@example.com`,
        password: "Password123!",
        roles: ["user"],
      });

      const first = await generateTokens(user);
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const second = await generateTokens(user);

      assert.notEqual(first.refreshToken, second.refreshToken, "rotation must mint a distinct token");

      const count = await userRefreshTokenModel.countDocuments({ userId: user._id });
      assert.equal(count, 1, "only the newest refresh token should remain");

      const stored = await userRefreshTokenModel.findOne({ userId: user._id }).lean();
      assert.equal(stored.token, second.refreshToken, "stored token must be the newest");

      await assert.rejects(
        () => verifyRefreshToken(first.refreshToken),
        "purged (old) refresh token must be rejected"
      );

      const ok = await verifyRefreshToken(second.refreshToken);
      assert.equal(ok.error, false, "newest refresh token must verify");
    } finally {
      if (user?._id) {
        await userRefreshTokenModel.deleteMany({ userId: user._id });
        await UserModel.deleteOne({ _id: user._id });
      }
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);
