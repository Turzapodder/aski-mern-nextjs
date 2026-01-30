import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/connectdb.js";
import AssignmentModel from "../models/Assignment.js";
import SubmissionModel from "../models/Submission.js";

dotenv.config();

const fallbackTitle = (assignmentTitle, index) =>
  assignmentTitle ? `${assignmentTitle} - Submission ${index + 1}` : `Submission ${index + 1}`;

const fallbackDescription = (entry) => {
  const note = typeof entry?.submissionNotes === "string" ? entry.submissionNotes.trim() : "";
  if (note) {
    return note.length > 200 ? `${note.slice(0, 200)}...` : note;
  }
  return "Backfilled submission details.";
};

const resolveSubmittedAt = (entry, assignment) => {
  if (entry?.submittedAt) return new Date(entry.submittedAt);
  if (assignment?.updatedAt) return new Date(assignment.updatedAt);
  if (assignment?.createdAt) return new Date(assignment.createdAt);
  return new Date();
};

const buildStatus = ({ assignment, isLatest, hasRevisions }) => {
  if (isLatest) {
    if (assignment.status === "completed") return "completed";
    if (assignment.status === "revision_requested") return "revision_requested";
    if (assignment.status === "submitted") return "submitted";
  }
  if (assignment.status === "revision_requested" || hasRevisions) {
    return "revision_requested";
  }
  return "submitted";
};

const main = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is missing");
    process.exit(1);
  }

  await connectDB(dbUrl);

  const assignments = await AssignmentModel.find({
    $or: [
      { "submissionHistory.0": { $exists: true } },
      { "submissionDetails.submissionFiles.0": { $exists: true } },
      { "submissionDetails.submissionLinks.0": { $exists: true } },
      { "submissionDetails.submissionNotes": { $exists: true } },
    ],
  }).lean();

  console.log(`Found ${assignments.length} assignments with submissions.`);

  let createdCount = 0;
  let updatedAssignments = 0;

  for (const assignment of assignments) {
    if (!assignment.assignedTutor) {
      console.warn(`Skipping assignment ${assignment._id} (no assigned tutor).`);
      continue;
    }
    const existing = await SubmissionModel.find({ assignment: assignment._id })
      .select("submittedAt title description revisionIndex")
      .lean();
    const existingKeys = new Set(
      existing.map(
        (entry) =>
          `${entry.submittedAt?.toISOString() || ""}|${entry.title || ""}|${entry.description || ""}`
      )
    );

    const history = Array.isArray(assignment.submissionHistory) && assignment.submissionHistory.length
      ? assignment.submissionHistory
      : assignment.submissionDetails
        ? [assignment.submissionDetails]
        : [];

    if (history.length === 0) continue;

    const hasRevisions = Array.isArray(assignment.revisionRequests) && assignment.revisionRequests.length > 0;

    const createdIds = [];

    for (let index = 0; index < history.length; index += 1) {
      const entry = history[index] || {};
      const submittedAt = resolveSubmittedAt(entry, assignment);
      const title = entry.title || fallbackTitle(assignment.title, index);
      const description = entry.description || fallbackDescription(entry);
      const key = `${submittedAt.toISOString()}|${title}|${description}`;

      if (existingKeys.has(key)) {
        createdIds.push(null);
        continue;
      }

      const isLatest = index === history.length - 1;
      const status = buildStatus({ assignment, isLatest, hasRevisions });
      const revisionIndex = Number.isFinite(entry.revisionIndex) ? entry.revisionIndex : index;

      const submissionDoc = await SubmissionModel.create({
        assignment: assignment._id,
        student: assignment.student,
        tutor: assignment.assignedTutor,
        title,
        description,
        submissionFiles: entry.submissionFiles || [],
        submissionLinks: entry.submissionLinks || [],
        submissionNotes: entry.submissionNotes || "",
        submittedAt,
        revisionIndex,
        status,
        review:
          isLatest && assignment.feedback?.rating
            ? {
                stars: assignment.feedback.rating,
                feedback: assignment.feedback.comments || "",
                reviewedAt: assignment.feedback.feedbackDate || new Date(),
              }
            : undefined,
      });

      createdIds.push(submissionDoc._id);
      createdCount += 1;
    }

    if (createdIds.some((id) => id)) {
      const assignmentDoc = await AssignmentModel.findById(assignment._id);
      if (assignmentDoc) {
        if (assignmentDoc.submissionHistory && assignmentDoc.submissionHistory.length) {
          assignmentDoc.submissionHistory.forEach((entry, idx) => {
            if (!entry.submissionId && createdIds[idx]) {
              entry.submissionId = createdIds[idx];
            }
          });
        } else if (assignmentDoc.submissionDetails) {
          assignmentDoc.submissionDetails.submissionId =
            assignmentDoc.submissionDetails.submissionId || createdIds[createdIds.length - 1] || null;
        }
        await assignmentDoc.save();
        updatedAssignments += 1;
      }
    }
  }

  console.log(`Backfill complete. Created submissions: ${createdCount}. Updated assignments: ${updatedAssignments}.`);

  await mongoose.connection.close();
  process.exit(0);
};

main().catch((error) => {
  console.error("Backfill failed:", error);
  mongoose.connection.close().finally(() => process.exit(1));
});
