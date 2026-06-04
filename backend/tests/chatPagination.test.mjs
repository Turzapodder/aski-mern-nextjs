import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import UserModel from "../models/User.js";
import ChatModel from "../models/Chat.js";
import MessageModel from "../models/Message.js";
import MessageController from "../controllers/messageController.js";

const databaseUrl = process.env.DATABASE_URL || "";

const connect = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(databaseUrl, { dbName: "aski-db" });
    return true;
  }
  return false;
};

const seedChat = async (seed, messageCount) => {
  const student = await UserModel.create({
    name: `Pager Student ${seed}`,
    email: `pager-student-${seed}@example.com`,
    password: "Password123!",
    roles: ["user"],
  });
  const tutor = await UserModel.create({
    name: `Pager Tutor ${seed}`,
    email: `pager-tutor-${seed}@example.com`,
    password: "Password123!",
    roles: ["tutor"],
  });
  const chat = await ChatModel.create({
    name: `Pager Chat ${seed}`,
    type: "direct",
    createdBy: student._id,
    participants: [{ user: student._id }, { user: tutor._id }],
  });

  let order = [];
  if (messageCount > 0) {
    const baseTime = Date.now() - messageCount * 1000;
    const docs = Array.from({ length: messageCount }, (_, i) => ({
      chat: chat._id,
      sender: i % 2 === 0 ? student._id : tutor._id,
      content: `message-${i}`,
      type: "text",
      createdAt: new Date(baseTime + i * 1000),
      updatedAt: new Date(baseTime + i * 1000),
    }));
    const inserted = await MessageModel.insertMany(docs, { timestamps: false });
    order = inserted.map((doc) => doc._id.toString());
  }

  return { student, tutor, chat, order };
};

const cleanup = async (ids) => {
  if (ids.chat) {
    await MessageModel.deleteMany({ chat: ids.chat });
    await ChatModel.deleteOne({ _id: ids.chat });
  }
  if (ids.student) await UserModel.deleteOne({ _id: ids.student });
  if (ids.tutor) await UserModel.deleteOne({ _id: ids.tutor });
  if (ids.outsider) await UserModel.deleteOne({ _id: ids.outsider });
};

const makeRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

const fetchPage = async (chatId, userId, page, limit) => {
  const req = {
    params: { chatId: chatId.toString() },
    query: { page, limit },
    user: { _id: userId },
  };
  const res = makeRes();
  await MessageController.getChatMessages(req, res);
  return res;
};

const fetchBefore = async (chatId, userId, before, limit) => {
  const req = {
    params: { chatId: chatId.toString() },
    query: { before, limit },
    user: { _id: userId },
  };
  const res = makeRes();
  await MessageController.getChatMessages(req, res);
  return res;
};

const idsOf = (res) => res.body.data.messages.map((m) => m._id.toString());

const timesOf = (res) => res.body.data.messages.map((m) => new Date(m.createdAt).getTime());

const reconstruct = (...pages) => {
  const map = new Map();
  pages.flat().forEach((m) => map.set(m._id.toString(), m));
  return [...map.values()]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => m._id.toString());
};

test(
  "newest-first paging with overlap; dedup+merge reconstructs full ascending history",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, chat, order } = await seedChat(seed, 25);
      ids = { student: student._id, tutor: tutor._id, chat: chat._id };

      const p1 = await fetchPage(chat._id, student._id, 1, 10);
      assert.equal(p1.statusCode, 200);
      assert.equal(p1.body.data.totalMessages, 25);
      assert.equal(p1.body.data.totalPages, 3);
      assert.equal(p1.body.data.currentPage, 1);
      assert.equal(p1.body.data.messages.length, 10);
      assert.deepEqual(idsOf(p1), order.slice(15, 25));
      assert.deepEqual(timesOf(p1), [...timesOf(p1)].sort((a, b) => a - b));

      const p2 = await fetchPage(chat._id, student._id, 2, 10);
      assert.deepEqual(idsOf(p2), order.slice(5, 15));

      const p3 = await fetchPage(chat._id, student._id, 3, 10);
      assert.deepEqual(idsOf(p3), order.slice(0, 10));

      const full = reconstruct(
        p3.body.data.messages,
        p2.body.data.messages,
        p1.body.data.messages
      );
      assert.deepEqual(full, order, "merged pages must equal complete history with no gaps or dupes");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "exact multiple of limit: two clean pages, no overlap, correct totalPages",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, chat, order } = await seedChat(seed, 20);
      ids = { student: student._id, tutor: tutor._id, chat: chat._id };

      const p1 = await fetchPage(chat._id, student._id, 1, 10);
      assert.equal(p1.body.data.totalPages, 2);
      assert.deepEqual(idsOf(p1), order.slice(10, 20));

      const p2 = await fetchPage(chat._id, student._id, 2, 10);
      assert.deepEqual(idsOf(p2), order.slice(0, 10));

      const overlap = idsOf(p1).filter((id) => idsOf(p2).includes(id));
      assert.equal(overlap.length, 0, "exact multiple must not overlap");
      assert.deepEqual(reconstruct(p2.body.data.messages, p1.body.data.messages), order);
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "chat smaller than the page limit returns everything on page 1 (totalPages 1)",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, chat, order } = await seedChat(seed, 3);
      ids = { student: student._id, tutor: tutor._id, chat: chat._id };

      const p1 = await fetchPage(chat._id, student._id, 1, 10);
      assert.equal(p1.body.data.totalPages, 1);
      assert.equal(p1.body.data.messages.length, 3);
      assert.deepEqual(idsOf(p1), order);
      assert.deepEqual(timesOf(p1), [...timesOf(p1)].sort((a, b) => a - b));
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "empty chat returns no messages and totalPages 0",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, chat } = await seedChat(seed, 0);
      ids = { student: student._id, tutor: tutor._id, chat: chat._id };

      const p1 = await fetchPage(chat._id, student._id, 1, 10);
      assert.equal(p1.statusCode, 200);
      assert.equal(p1.body.data.messages.length, 0);
      assert.equal(p1.body.data.totalMessages, 0);
      assert.equal(p1.body.data.totalPages, 0);
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "non-participant cannot read messages (403)",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, chat } = await seedChat(seed, 5);
      const outsider = await UserModel.create({
        name: `Pager Outsider ${seed}`,
        email: `pager-outsider-${seed}@example.com`,
        password: "Password123!",
        roles: ["user"],
      });
      ids = {
        student: student._id,
        tutor: tutor._id,
        chat: chat._id,
        outsider: outsider._id,
      };

      const denied = await fetchPage(chat._id, outsider._id, 1, 10);
      assert.equal(denied.statusCode, 403);
      assert.equal(denied.body.status, "failed");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "cursor (before) paging walks older messages with accurate hasMore and full reconstruction",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, chat, order } = await seedChat(seed, 25);
      ids = { student: student._id, tutor: tutor._id, chat: chat._id };

      const live = await fetchPage(chat._id, student._id, 1, 10);
      assert.deepEqual(idsOf(live), order.slice(15, 25));

      const oldestLive = live.body.data.messages[0].createdAt;
      const older1 = await fetchBefore(chat._id, student._id, new Date(oldestLive).toISOString(), 10);
      assert.equal(older1.body.data.hasMore, true);
      assert.deepEqual(idsOf(older1), order.slice(5, 15));
      assert.deepEqual(timesOf(older1), [...timesOf(older1)].sort((a, b) => a - b));

      const oldest1 = older1.body.data.messages[0].createdAt;
      const older2 = await fetchBefore(chat._id, student._id, new Date(oldest1).toISOString(), 10);
      assert.equal(older2.body.data.hasMore, false, "no more pages after the oldest 5");
      assert.deepEqual(idsOf(older2), order.slice(0, 5));

      const full = reconstruct(
        older2.body.data.messages,
        older1.body.data.messages,
        live.body.data.messages
      );
      assert.deepEqual(full, order, "cursor pages reconstruct the complete history");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);

test(
  "cursor paging does not drop a boundary message when one is soft-deleted between fetches",
  { skip: !databaseUrl ? "Set DATABASE_URL to run DB integration tests" : false },
  async () => {
    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    let connectedHere = false;
    let ids = {};
    try {
      connectedHere = await connect();
      const { student, tutor, chat, order } = await seedChat(seed, 25);
      ids = { student: student._id, tutor: tutor._id, chat: chat._id };

      const live = await fetchPage(chat._id, student._id, 1, 10);
      const oldestLive = live.body.data.messages[0].createdAt;

      await MessageModel.updateOne({ _id: order[20] }, { $set: { isDeleted: true } });

      const older = await fetchBefore(chat._id, student._id, new Date(oldestLive).toISOString(), 10);
      const olderIds = idsOf(older);

      assert.equal(olderIds.includes(order[14]), true, "boundary message must not be skipped");
      assert.deepEqual(olderIds, order.slice(5, 15), "cursor window is unaffected by a delete outside it");
    } finally {
      await cleanup(ids);
      if (connectedHere && mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
);
