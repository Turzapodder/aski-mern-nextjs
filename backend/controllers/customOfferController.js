import mongoose from "mongoose";
import CustomOfferModel from "../models/CustomOffer.js";
import ChatModel from "../models/Chat.js";
import AssignmentModel from "../models/Assignment.js";
import ProposalModel from "../models/Proposal.js";
import MessageModel from "../models/Message.js";

const CUSTOM_OFFER_EXPIRY_DAYS = Number(process.env.CUSTOM_OFFER_EXPIRY_DAYS || 3);

const isFutureDate = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > Date.now();
};

const buildExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Math.max(1, CUSTOM_OFFER_EXPIRY_DAYS));
  return expiresAt;
};

class CustomOfferController {
  static getActiveOffer = async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user._id;

      const chat = await ChatModel.findOne({
        _id: chatId,
        "participants.user": userId,
        isActive: true,
      });

      if (!chat) {
        return res.status(404).json({
          status: "failed",
          message: "Chat not found or access denied",
        });
      }

      const offer = await CustomOfferModel.findOne({
        conversation: chatId,
        status: "pending",
      })
        .populate("tutor", "name email profileImage")
        .populate("student", "name email profileImage")
        .lean();

      if (!offer) {
        return res.status(200).json({
          status: "success",
          data: null,
        });
      }

      if (offer.expiresAt && offer.expiresAt.getTime() < Date.now()) {
        await CustomOfferModel.updateOne(
          { _id: offer._id },
          { $set: { status: "expired" } }
        );
        await CustomOfferModel.deleteOne({ _id: offer._id });
        return res.status(200).json({
          status: "success",
          data: null,
        });
      }

      return res.status(200).json({
        status: "success",
        data: offer,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to fetch custom offer",
      });
    }
  };

  static createOffer = async (req, res) => {
    try {
      const { conversationId, assignmentId, title, description, proposedBudget, proposedDeadline, message } = req.body || {};
      const userId = req.user._id;
      const roles = Array.isArray(req.user.roles) ? req.user.roles : [];

      if (!roles.includes("tutor")) {
        return res.status(403).json({
          status: "failed",
          message: "Only tutors can send custom offers",
        });
      }

      if (!conversationId) {
        return res.status(400).json({
          status: "failed",
          message: "Conversation is required",
        });
      }

      const budgetValue = Number(proposedBudget);
      if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
        return res.status(400).json({
          status: "failed",
          message: "Budget must be a positive number",
        });
      }

      if (!isFutureDate(proposedDeadline)) {
        return res.status(400).json({
          status: "failed",
          message: "Deadline must be a future date",
        });
      }

      const chat = await ChatModel.findOne({
        _id: conversationId,
        "participants.user": userId,
        isActive: true,
      });

      if (!chat) {
        return res.status(404).json({
          status: "failed",
          message: "Chat not found or access denied",
        });
      }



      let assignment = assignmentId
        ? await AssignmentModel.findById(assignmentId)
        : chat.assignment
          ? await AssignmentModel.findById(chat.assignment)
          : null;

      const studentParticipant = chat.participants.find(
        (participant) => {
           const participantId = participant.user._id || participant.user;
           return participantId.toString() !== userId.toString();
        }
      );

      if (!studentParticipant) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to identify student for this conversation",
        });
      }

      if (!assignment) {
        if (!title) {
          return res.status(400).json({
            status: "failed",
            message: "Assignment title is required for a new offer",
          });
        }
        
        assignment = await AssignmentModel.create({
          title: title.trim(),
          description: description?.trim() || title.trim(),
          subject: "Custom",
          student: studentParticipant.user,
          deadline: new Date(proposedDeadline),
          budget: budgetValue,
          estimatedCost: budgetValue,
          status: "draft",
        });

        chat.assignment = assignment._id;
        chat.assignmentTitle = assignment.title;
        await chat.save();
      }

      let proposal = await ProposalModel.findOne({
        conversation: conversationId,
        tutor: userId,
        isActive: true,
      });

      if (!proposal) {
        proposal = await ProposalModel.create({
          assignment: assignment._id,
          tutor: userId,
          student: studentParticipant.user,
          title: assignment.title,
          description: assignment.description,
          proposedPrice: budgetValue,
          estimatedDeliveryTime: 24,
          conversation: conversationId,
          status: "pending",
        });
      }

      const pendingOffer = await CustomOfferModel.findOne({
        conversation: conversationId,
        status: "pending",
      });

      if (pendingOffer) {
        return res.status(400).json({
          status: "failed",
          message: "There is already a pending custom offer for this conversation",
        });
      }



      const offer = await CustomOfferModel.create({
        assignment: assignment._id,
        conversation: conversationId,
        tutor: userId,
        student: studentParticipant.user,
        title: typeof title === "string" ? title.trim() : assignment.title,
        description: typeof description === "string" ? description.trim() : assignment.description,
        proposedBudget: budgetValue,
        proposedDeadline: new Date(proposedDeadline),
        message: typeof message === "string" ? message.trim() : "",
        status: "pending",
        expiresAt: buildExpiry(),
      });

      const offerMessage = await MessageModel.create({
        chat: conversationId,
        sender: userId,
        type: "offer",
        content: "",
        meta: {
          offerId: offer._id,
          title: offer.title,
          description: offer.description,
          proposedBudget: offer.proposedBudget,
          proposedDeadline: offer.proposedDeadline,
          message: offer.message,
          status: offer.status,
          expiresAt: offer.expiresAt,
        },
      });

      chat.lastMessage = offerMessage._id;
      chat.lastActivity = new Date();
      await chat.save();

      const socketManager = req.app.get("socketManager");
      if (socketManager) {
        await offerMessage.populate("sender", "name email avatar");
        socketManager.sendToChat(conversationId, "new_message", {
          message: offerMessage,
          chatId: conversationId,
        });
      }

      return res.status(201).json({
        status: "success",
        message: "Custom offer sent",
        data: offer,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to send custom offer",
      });
    }
  };

  static acceptOffer = async (req, res) => {
    const session = await mongoose.startSession();
    const shouldFallbackToNoTransaction = (error) => {
      const message = error?.message || "";
      return (
        message.includes("Transaction numbers are only allowed") ||
        message.includes("Transactions are not supported") ||
        message.includes("replica set") ||
        message.includes("mongos")
      );
    };
    try {
      const { offerId } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(offerId)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid offer ID",
        });
      }

      let responsePayload;
      let confirmationMessage = null;
      let conversationId = null;

      const processAccept = async (activeSession) => {
        const offerQuery = CustomOfferModel.findOne({
          _id: offerId,
          status: "pending",
        });
        const offer = activeSession ? await offerQuery.session(activeSession) : await offerQuery;

        if (!offer) {
          throw new Error("Offer not found");
        }

        if (offer.student.toString() !== userId.toString()) {
          throw new Error("Not authorized to accept this offer");
        }

        if (offer.expiresAt && offer.expiresAt.getTime() < Date.now()) {
          throw new Error("Offer has expired");
        }

        const assignmentQuery = AssignmentModel.findById(offer.assignment);
        const assignment = activeSession
          ? await assignmentQuery.session(activeSession)
          : await assignmentQuery;
        if (!assignment) {
          throw new Error("Assignment not found");
        }

        assignment.title = offer.title || assignment.title;
        assignment.description = offer.description || assignment.description;
        assignment.budget = offer.proposedBudget;
        assignment.estimatedCost = offer.proposedBudget;
        assignment.deadline = offer.proposedDeadline;
        if (["pending", "created", "proposal_received", "assigned"].includes(assignment.status)) {
          assignment.status = "proposal_accepted";
        }
        assignment.assignedTutor = assignment.assignedTutor || offer.tutor;
        assignment.paymentStatus = "pending";
        assignment.paymentAmount = offer.proposedBudget;
        assignment.chatId = assignment.chatId || offer.conversation;
        await assignment.save(activeSession ? { session: activeSession } : undefined);

        await ProposalModel.updateOne(
          { conversation: offer.conversation, status: "pending" },
          { $set: { status: "accepted", acceptedAt: new Date() } },
          activeSession ? { session: activeSession } : undefined
        );

        await MessageModel.updateMany(
          { chat: offer.conversation, type: "offer", "meta.offerId": offer._id },
          { $set: { "meta.status": "accepted" } },
          activeSession ? { session: activeSession } : undefined
        );

        const confirmation = await MessageModel.create(
          [
            {
              chat: offer.conversation,
              sender: userId,
              content: "Custom offer accepted.",
              type: "text",
            },
          ],
          activeSession ? { session: activeSession } : undefined
        );

        await ChatModel.updateOne(
          { _id: offer.conversation },
          { $set: { lastMessage: confirmation[0]._id, lastActivity: new Date() } },
          activeSession ? { session: activeSession } : undefined
        );

        if (activeSession) {
          await CustomOfferModel.deleteOne({ _id: offer._id }).session(activeSession);
        } else {
          await CustomOfferModel.deleteOne({ _id: offer._id });
        }

        responsePayload = {
          assignmentId: assignment._id,
          budget: assignment.budget,
          deadline: assignment.deadline,
        };
        confirmationMessage = confirmation[0];
        conversationId = offer.conversation?.toString();
      };

      try {
        await session.withTransaction(async () => {
          await processAccept(session);
        });
      } catch (error) {
        if (shouldFallbackToNoTransaction(error)) {
          await processAccept(null);
        } else {
          throw error;
        }
      }

      if (confirmationMessage && conversationId) {
        const socketManager = req.app.get("socketManager");
        if (socketManager) {
          const populated = await MessageModel.findById(confirmationMessage._id).populate(
            "sender",
            "name email avatar"
          );
          socketManager.sendToChat(conversationId, "new_message", {
            message: populated || confirmationMessage,
            chatId: conversationId,
          });
        }
      }

      return res.status(200).json({
        status: "success",
        message: "Custom offer accepted",
        data: responsePayload,
      });
    } catch (error) {
      const message =
        error.message === "Offer not found"
          ? "Offer not found"
          : error.message || "Unable to accept offer";
      const statusCode =
        message === "Offer not found" || message === "Offer has expired" || message === "Assignment not found"
          ? 404
          : message.includes("Not authorized")
            ? 403
            : 500;
      return res.status(statusCode).json({
        status: "failed",
        message,
      });
    } finally {
      session.endSession();
    }
  };

  static declineOffer = async (req, res) => {
    const session = await mongoose.startSession();
    const shouldFallbackToNoTransaction = (error) => {
      const message = error?.message || "";
      return (
        message.includes("Transaction numbers are only allowed") ||
        message.includes("Transactions are not supported") ||
        message.includes("replica set") ||
        message.includes("mongos")
      );
    };
    try {
      const { offerId } = req.params;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(offerId)) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid offer ID",
        });
      }

      let declineMessage = null;
      let conversationId = null;

      const processDecline = async (activeSession) => {
        const offerQuery = CustomOfferModel.findOne({
          _id: offerId,
          status: "pending",
        });
        const offer = activeSession ? await offerQuery.session(activeSession) : await offerQuery;

        if (!offer) {
          throw new Error("Offer not found");
        }

        if (offer.student.toString() !== userId.toString()) {
          throw new Error("Not authorized to decline this offer");
        }

        await MessageModel.updateMany(
          { chat: offer.conversation, type: "offer", "meta.offerId": offer._id },
          { $set: { "meta.status": "declined" } },
          activeSession ? { session: activeSession } : undefined
        );

        const decline = await MessageModel.create(
          [
            {
              chat: offer.conversation,
              sender: userId,
              content: "Custom offer declined.",
              type: "text",
            },
          ],
          activeSession ? { session: activeSession } : undefined
        );

        await ChatModel.updateOne(
          { _id: offer.conversation },
          { $set: { lastMessage: decline[0]._id, lastActivity: new Date() } },
          activeSession ? { session: activeSession } : undefined
        );

        if (activeSession) {
          await CustomOfferModel.deleteOne({ _id: offer._id }).session(activeSession);
        } else {
          await CustomOfferModel.deleteOne({ _id: offer._id });
        }

        declineMessage = decline[0];
        conversationId = offer.conversation?.toString();
      };

      try {
        await session.withTransaction(async () => {
          await processDecline(session);
        });
      } catch (error) {
        if (shouldFallbackToNoTransaction(error)) {
          await processDecline(null);
        } else {
          throw error;
        }
      }

      if (declineMessage && conversationId) {
        const socketManager = req.app.get("socketManager");
        if (socketManager) {
          const populated = await MessageModel.findById(declineMessage._id).populate(
            "sender",
            "name email avatar"
          );
          socketManager.sendToChat(conversationId, "new_message", {
            message: populated || declineMessage,
            chatId: conversationId,
          });
        }
      }

      return res.status(200).json({
        status: "success",
        message: "Custom offer declined",
      });
    } catch (error) {
      const message =
        error.message === "Offer not found"
          ? "Offer not found"
          : error.message || "Unable to decline offer";
      const statusCode =
        message === "Offer not found" ? 404 : message.includes("Not authorized") ? 403 : 500;
      return res.status(statusCode).json({
        status: "failed",
        message,
      });
    } finally {
      session.endSession();
    }
  };
}

export default CustomOfferController;
