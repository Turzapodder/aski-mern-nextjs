import test from "node:test";
import assert from "node:assert/strict";

import { assignmentFileFilter, imageFileFilter } from "../config/s3Config.js";

const run = (filter, file) =>
  new Promise((resolve) => {
    filter({}, file, (err, ok) => resolve({ rejected: !!err, ok: ok === true }));
  });

test("assignmentFileFilter blocks executables and web-renderable types, allows docs", async () => {
  assert.equal((await run(assignmentFileFilter, { originalname: "report.pdf", mimetype: "application/pdf" })).ok, true);
  assert.equal((await run(assignmentFileFilter, { originalname: "clip.mp4", mimetype: "video/mp4" })).ok, true);
  assert.equal((await run(assignmentFileFilter, { originalname: "malware.exe", mimetype: "application/x-msdownload" })).rejected, true);
  assert.equal((await run(assignmentFileFilter, { originalname: "xss.html", mimetype: "text/html" })).rejected, true);
  assert.equal((await run(assignmentFileFilter, { originalname: "xss.svg", mimetype: "image/svg+xml" })).rejected, true);
});

test("imageFileFilter allows images only", async () => {
  assert.equal((await run(imageFileFilter, { originalname: "a.png", mimetype: "image/png" })).ok, true);
  assert.equal((await run(imageFileFilter, { originalname: "a.jpg", mimetype: "image/jpeg" })).ok, true);
  assert.equal((await run(imageFileFilter, { originalname: "a.pdf", mimetype: "application/pdf" })).rejected, true);
  assert.equal((await run(imageFileFilter, { originalname: "a.svg", mimetype: "image/svg+xml" })).rejected, true);
});
