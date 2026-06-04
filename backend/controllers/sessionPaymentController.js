import mongoose from "mongoose";
import SessionModel from "../models/Session.js";
import UserModel from "../models/User.js";
import ChatModel from "../models/Chat.js";
import TransactionModel from "../models/Transaction.js";
import NotificationModel from "../models/Notification.js";
import PlatformSettingsModel from "../models/PlatformSettings.js";
import {
  createUddoktaCheckout,
  verifyUddoktaPayment,
  isUddoktaConfigured,
  isSuccessfulCheckoutResponse,
  extractInvoiceIdFromValue,
  normalizePaymentStatus,
  isValidUddoktaWebhookRequest,
} from "../utils/uddoktaPay.js";

const sanitizeText = (value) => (typeof value === "string" ? value.trim() : "");

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isUddoktaMockModeEnabled = () =>
  ["1", "true", "yes", "on"].includes(
    sanitizeText(process.env.UDDOKTAPAY_MOCK_MODE || "").toLowerCase()
  );

const normalizeMockPaymentMethod = (value) => {
  const normalized = sanitizeText(value).toLowerCase();
  return ["bkash", "nagad", "rocket", "card", "bank"].includes(normalized)
    ? normalized
    : "bkash";
};

const createMockInvoiceId = () =>
  `MOCK-SES-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

const getConfiguredPaymentCurrency = (preferredCurrency) => {
  const envCurrency = sanitizeText(
    process.env.UDDOKTAPAY_CURRENCY || process.env.PAYMENT_CURRENCY
  );
  const candidate = (envCurrency || sanitizeText(preferredCurrency) || "BDT").toUpperCase();
  return /^[A-Z]{3}$/.test(candidate) ? candidate : "BDT";
};

const getDefaultPlatformFeeRate = () => {
  const parsed = parseNumber(process.env.PLATFORM_FEE_RATE, NaN);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0;
};

const getDefaultMinTransactionFee = () => {
  const parsed = parseNumber(process.env.MIN_TRANSACTION_FEE, NaN);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const isLocalHostValue = (value = "") =>
  /(^https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(sanitizeText(value));

const getFrontendBaseUrl = () => {
  const value = sanitizeText(process.env.FRONTEND_HOST || "");
  return value ? value.replace(/\/+$/, "") : "http://localhost:3000";
};

const getBackendBaseUrl = (req) => {
  const configured = sanitizeText(
    process.env.BACKEND_PUBLIC_URL || process.env.BACKEND_HOST || ""
  );
  const forwardedProto = sanitizeText(req?.headers?.["x-forwarded-proto"]);
  const protocol = forwardedProto || req?.protocol || "http";
  const host = sanitizeText(req?.get?.("host"));
  const inferred = host ? `${protocol}://${host}` : "";

  if (configured) {
    if (isLocalHostValue(configured) && inferred && !isLocalHostValue(inferred)) {
      return inferred.replace(/\/+$/, "");
    }
    return configured.replace(/\/+$/, "");
  }
  return inferred ? inferred.replace(/\/+$/, "") : "http://localhost:8000";
};

const sanitizePaymentSnapshot = (verifyData = {}) => ({
  status: sanitizeText(verifyData.status),
  amount: parseNumber(verifyData.amount, 0),
  transactionId: sanitizeText(verifyData.transaction_id),
  paymentMethod: sanitizeText(verifyData.payment_method),
  senderNumber: sanitizeText(verifyData.sender_number),
  date: sanitizeText(verifyData.date),
});

const getMockVerificationResponse = ({ invoiceId, sessionId, amount, method, status }) => {
  const normalizedStatus = sanitizeText(status || "COMPLETED").toUpperCase();
  const roundedAmount = Number(parseNumber(amount, 0).toFixed(2));
  return {
    full_name: "Mock Customer",
    email: "mock@example.com",
    amount: roundedAmount,
    currency: "BDT",
    fee: 0,
    charged_amount: roundedAmount,
    invoice_id: invoiceId,
    metadata: { sessionId, type: "session" },
    payment_method: normalizeMockPaymentMethod(method),
    sender_number: "01700000000",
    transaction_id: `MOCK-TXN-${invoiceId}`,
    date: new Date().toISOString(),
    status: normalizedStatus,
  };
};

const buildSessionMockGatewayUrl = ({ backendBaseUrl, sessionId, invoiceId, method }) => {
  const url = new URL(`${backendBaseUrl}/api/sessions/payment/mock`);
  url.searchParams.set("session_id", sessionId);
  url.searchParams.set("invoice_id", invoiceId);
  url.searchParams.set("method", normalizeMockPaymentMethod(method));
  return url.toString();
};

const buildSessionMockStatusUrl = ({ backendBaseUrl, sessionId, invoiceId, method, status }) => {
  const url = new URL(`${backendBaseUrl}/api/sessions/payment/mock-complete`);
  url.searchParams.set("session_id", sessionId);
  url.searchParams.set("invoice_id", invoiceId);
  url.searchParams.set("method", normalizeMockPaymentMethod(method));
  url.searchParams.set("status", status);
  return url.toString();
};

const buildSessionRedirectUrl = ({ sessionId, paymentState, invoiceId }) => {
  const url = new URL(`${getFrontendBaseUrl()}/user/calendar`);
  if (sessionId) url.searchParams.set("session", String(sessionId));
  if (paymentState) url.searchParams.set("payment", paymentState);
  if (invoiceId) url.searchParams.set("invoice", invoiceId);
  return url.toString();
};

const findSessionIdByInvoiceId = async (invoiceId) => {
  if (!invoiceId) return "";
  const byGateway = await SessionModel.findOne(
    { "paymentGateway.invoiceId": invoiceId },
    { _id: 1 }
  ).lean();
  if (byGateway?._id) return String(byGateway._id);

  const tx = await TransactionModel.findOne({
    type: "escrow_hold",
    $or: [{ gatewayId: invoiceId }, { "metadata.invoiceId": invoiceId }],
  })
    .sort({ createdAt: -1 })
    .lean();
  if (tx?.relatedTo?.model === "Session" && tx?.relatedTo?.id) {
    return String(tx.relatedTo.id);
  }
  return "";
};

const emitSessionPaymentNotification = async ({ session, app }) => {
  if (!session?.tutor) return;
  const student = await UserModel.findById(session.student).select("name").lean();
  const actorName = student?.name || "A student";
  const notification = await NotificationModel.create({
    user: session.tutor,
    type: "payment_received",
    title: "Session payment confirmed",
    message: `${actorName} paid for a ${session.subject || "tutoring"} session.`,
    link: `/user/calendar`,
    data: { sessionId: session._id },
  });
  const socketManager = app?.get?.("socketManager");
  if (socketManager) {
    socketManager.emitToUser(String(session.tutor), "notification", { notification });
  }
};

export const initiateSessionCheckout = async (sessionDoc, req) => {
  const isMockMode = isUddoktaMockModeEnabled();
  if (!isMockMode && !isUddoktaConfigured()) {
    throw new Error("Payment gateway is not configured");
  }

  const amount = Number(parseNumber(sessionDoc.price, 0).toFixed(2));
  if (!amount || amount <= 0) {
    throw new Error("Session price must be greater than 0");
  }

  const checkoutCurrency = getConfiguredPaymentCurrency(req.user?.wallet?.currency);
  const method = normalizeMockPaymentMethod(req.body?.method);
  const backendBaseUrl = getBackendBaseUrl(req);

  const callbackUrl = new URL(`${backendBaseUrl}/api/sessions/payment/callback`);
  callbackUrl.searchParams.set("session_id", String(sessionDoc._id));
  const cancelUrl = new URL(`${backendBaseUrl}/api/sessions/payment/cancel`);
  cancelUrl.searchParams.set("session_id", String(sessionDoc._id));
  const webhookUrl = new URL(`${backendBaseUrl}/api/sessions/payment/webhook`);

  let checkoutUrl = "";
  let invoiceId = "";

  if (isMockMode) {
    invoiceId = createMockInvoiceId();
    checkoutUrl = buildSessionMockGatewayUrl({
      backendBaseUrl,
      sessionId: String(sessionDoc._id),
      invoiceId,
      method,
    });
  } else {
    const checkout = await createUddoktaCheckout({
      full_name: req.user?.name || "Student",
      email: req.user?.email || "",
      amount,
      currency: checkoutCurrency,
      metadata: {
        sessionId: String(sessionDoc._id),
        studentId: String(sessionDoc.student),
        type: "session",
        method,
        currency: checkoutCurrency,
      },
      redirect_url: callbackUrl.toString(),
      cancel_url: cancelUrl.toString(),
      webhook_url: webhookUrl.toString(),
      return_type: "GET",
    });
    checkoutUrl = sanitizeText(checkout?.payment_url);
    if (!isSuccessfulCheckoutResponse(checkout) || !checkoutUrl) {
      throw new Error(checkout?.message || "Unable to initialize payment");
    }
    invoiceId =
      extractInvoiceIdFromValue(checkout?.invoice_id) ||
      extractInvoiceIdFromValue(checkout?.data) ||
      extractInvoiceIdFromValue(checkoutUrl);
  }

  sessionDoc.paymentStatus = "pending";
  sessionDoc.paymentGateway = {
    provider: "uddoktapay",
    invoiceId,
    checkoutUrl,
    status: "pending",
    initiatedAt: new Date(),
    metadata: { currency: checkoutCurrency, mode: isMockMode ? "mock" : "live" },
  };
  await sessionDoc.save();

  await TransactionModel.create({
    userId: sessionDoc.student,
    type: "escrow_hold",
    amount,
    status: "pending",
    gatewayId: invoiceId || undefined,
    relatedTo: { model: "Session", id: sessionDoc._id },
    metadata: {
      provider: "uddoktapay",
      invoiceId,
      paymentMethod: method,
      currency: checkoutCurrency,
      checkoutUrl,
      mode: isMockMode ? "mock" : "live",
    },
  });

  return { checkoutUrl, invoiceId, amount, currency: checkoutCurrency };
};

export const verifyAndApplySessionPayment = async ({ invoiceId, source, app, deps = {} }) => {
  const cleanInvoiceId = sanitizeText(invoiceId);
  if (!cleanInvoiceId) throw new Error("Invoice ID is required");

  const verifyPaymentFn = deps.verifyPaymentFn || verifyUddoktaPayment;
  const SessionRepo = deps.SessionModel || SessionModel;
  const UserRepo = deps.UserModel || UserModel;
  const TransactionRepo = deps.TransactionModel || TransactionModel;
  const ChatRepo = deps.ChatModel || ChatModel;
  const mongooseRepo = deps.mongoose || mongoose;
  const findSessionIdFn = deps.findSessionIdByInvoiceIdFn || findSessionIdByInvoiceId;
  const emitNotificationFn = deps.emitSessionPaymentNotificationFn || emitSessionPaymentNotification;

  const verifyData = await verifyPaymentFn(cleanInvoiceId);
  const paymentState = normalizePaymentStatus(verifyData?.status);
  const metadata =
    verifyData?.metadata && typeof verifyData.metadata === "object" ? verifyData.metadata : {};

  let sessionId = sanitizeText(metadata.sessionId || metadata.session_id);
  if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    sessionId = await findSessionIdFn(cleanInvoiceId);
  }
  if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new Error("Unable to map invoice to session");
  }

  const txnSession = await mongooseRepo.startSession();
  let result = null;

  try {
    await txnSession.withTransaction(async () => {
      const current = await SessionRepo.findById(sessionId).session(txnSession);
      if (!current) throw new Error("Session not found");

      const snapshot = sanitizePaymentSnapshot(verifyData);
      const amount = parseNumber(current.price, 0);
      const isCompleted = paymentState === "completed";
      const existingGateway = current.paymentGateway || {};
      const gatewayUpdate = {
        ...existingGateway,
        provider: "uddoktapay",
        invoiceId: cleanInvoiceId,
        transactionId: snapshot.transactionId || existingGateway.transactionId,
        paymentMethod: snapshot.paymentMethod || existingGateway.paymentMethod,
        status: paymentState,
        verifiedAt: new Date(),
        metadata: { ...(existingGateway.metadata || {}), source, latest: snapshot },
      };

      let after = current;
      let didTransitionToPaid = false;

      if (isCompleted && amount > 0) {
        const transitioned = await SessionRepo.findOneAndUpdate(
          { _id: current._id, paymentStatus: { $ne: "paid" } },
          { $set: { paymentStatus: "paid", status: "scheduled", paymentGateway: gatewayUpdate } },
          { new: true, session: txnSession }
        );
        if (transitioned) {
          after = transitioned;
          didTransitionToPaid = true;
        } else {
          await SessionRepo.updateOne(
            { _id: current._id },
            { $set: { paymentGateway: gatewayUpdate } },
            { session: txnSession }
          );
          after = await SessionRepo.findById(current._id).session(txnSession);
        }
      } else {
        await SessionRepo.updateOne(
          { _id: current._id },
          { $set: { paymentGateway: gatewayUpdate } },
          { session: txnSession }
        );
        after = await SessionRepo.findById(current._id).session(txnSession);
      }

      if (didTransitionToPaid) {
        const walletUpdate = await UserRepo.updateOne(
          { _id: after.student },
          { $inc: { "wallet.escrowBalance": amount } },
          { session: txnSession }
        );
        if (!walletUpdate?.matchedCount) throw new Error("Student wallet update failed");

        if (after.chat) {
          await ChatRepo.updateOne(
            { _id: after.chat },
            { $set: { isLockedUntil: after.scheduledTime } },
            { session: txnSession }
          );
        }
      }

      const txFilter = {
        type: "escrow_hold",
        "relatedTo.model": "Session",
        "relatedTo.id": after._id,
      };
      let escrowTransaction = await TransactionRepo.findOne({
        ...txFilter,
        $or: [{ gatewayId: cleanInvoiceId }, { "metadata.invoiceId": cleanInvoiceId }],
      }).session(txnSession);
      if (!escrowTransaction) {
        escrowTransaction = await TransactionRepo.findOne(txFilter)
          .sort({ createdAt: -1 })
          .session(txnSession);
      }

      const transactionStatus = isCompleted
        ? "completed"
        : paymentState === "failed"
        ? "failed"
        : paymentState === "cancelled"
        ? "cancelled"
        : "pending";

      if (escrowTransaction) {
        escrowTransaction.gatewayId = cleanInvoiceId;
        escrowTransaction.status = transactionStatus;
        if (amount > 0) escrowTransaction.amount = amount;
        escrowTransaction.metadata = {
          ...(escrowTransaction.metadata || {}),
          provider: "uddoktapay",
          invoiceId: cleanInvoiceId,
          paymentMethod: snapshot.paymentMethod || escrowTransaction.metadata?.paymentMethod,
          verificationStatus: sanitizeText(verifyData?.status),
          verificationSource: source,
        };
        await escrowTransaction.save({ session: txnSession });
      } else if (didTransitionToPaid && amount > 0) {
        await TransactionRepo.create(
          [
            {
              userId: after.student,
              type: "escrow_hold",
              amount,
              status: transactionStatus,
              gatewayId: cleanInvoiceId,
              relatedTo: { model: "Session", id: after._id },
              metadata: {
                provider: "uddoktapay",
                invoiceId: cleanInvoiceId,
                paymentMethod: snapshot.paymentMethod,
                verificationStatus: sanitizeText(verifyData?.status),
                verificationSource: source,
              },
            },
          ],
          { session: txnSession }
        );
      }

      result = {
        sessionId: String(after._id),
        paymentState,
        isCompleted,
        didTransitionToPaid,
        wasAlreadyPaid: !didTransitionToPaid && after.paymentStatus === "paid",
        session: after.toObject(),
      };
    });
  } finally {
    txnSession.endSession();
  }

  if (result?.didTransitionToPaid) {
    await emitNotificationFn({ session: result.session, app });
  }
  return result;
};

export const releaseSessionEscrow = async ({ sessionId, deps = {} }) => {
  const SessionRepo = deps.SessionModel || SessionModel;
  const UserRepo = deps.UserModel || UserModel;
  const TransactionRepo = deps.TransactionModel || TransactionModel;
  const PlatformSettingsRepo = deps.PlatformSettingsModel || PlatformSettingsModel;
  const mongooseRepo = deps.mongoose || mongoose;

  const txnSession = await mongooseRepo.startSession();
  let outcome = { didComplete: false, session: null };

  try {
    await txnSession.withTransaction(async () => {
      const transitioned = await SessionRepo.findOneAndUpdate(
        { _id: sessionId, status: "scheduled", paymentStatus: "paid" },
        { $set: { status: "completed" } },
        { new: true, session: txnSession }
      );
      if (!transitioned) {
        outcome = { didComplete: false, session: null };
        return;
      }

      const amount = parseNumber(transitioned.price, 0);
      if (amount > 0) {
        const settings = await PlatformSettingsRepo.findOne().session(txnSession).lean();
        const platformFeeRate = parseNumber(settings?.platformFeeRate, getDefaultPlatformFeeRate());
        const minTransactionFee = parseNumber(settings?.minTransactionFee, getDefaultMinTransactionFee());
        let platformFee = Math.max(0, amount * platformFeeRate);
        if (platformFee > 0 && minTransactionFee > 0) {
          platformFee = Math.max(platformFee, minTransactionFee);
        }
        const tutorNet = Math.max(0, amount - platformFee);

        const debit = await UserRepo.updateOne(
          { _id: transitioned.student, "wallet.escrowBalance": { $gte: amount } },
          { $inc: { "wallet.escrowBalance": -amount } },
          { session: txnSession }
        );
        if (debit.modifiedCount !== 1) throw new Error("SESSION_ESCROW_INSUFFICIENT_FUNDS");

        if (tutorNet > 0) {
          await UserRepo.updateOne(
            { _id: transitioned.tutor },
            { $inc: { "wallet.availableBalance": tutorNet, "wallet.totalEarnings": tutorNet } },
            { session: txnSession }
          );
        }

        const ledger = [];
        if (tutorNet > 0) {
          ledger.push({
            userId: transitioned.tutor,
            type: "escrow_release",
            amount: tutorNet,
            status: "completed",
            relatedTo: { model: "Session", id: transitioned._id },
            metadata: { resolution: "session_completion" },
          });
        }
        if (platformFee > 0) {
          ledger.push({
            userId: transitioned.tutor,
            type: "platform_fee",
            amount: platformFee,
            status: "completed",
            relatedTo: { model: "Session", id: transitioned._id },
            metadata: { resolution: "session_completion" },
          });
        }
        if (ledger.length) await TransactionRepo.create(ledger, { session: txnSession });
      }

      outcome = { didComplete: true, session: transitioned.toObject() };
    });
  } finally {
    txnSession.endSession();
  }
  return outcome;
};

export const refundSessionEscrow = async ({ sessionId, deps = {} }) => {
  const SessionRepo = deps.SessionModel || SessionModel;
  const UserRepo = deps.UserModel || UserModel;
  const TransactionRepo = deps.TransactionModel || TransactionModel;
  const mongooseRepo = deps.mongoose || mongoose;

  const txnSession = await mongooseRepo.startSession();
  let outcome = { didCancel: false, refunded: false, session: null };

  try {
    await txnSession.withTransaction(async () => {
      const paidCancel = await SessionRepo.findOneAndUpdate(
        { _id: sessionId, status: "scheduled", paymentStatus: "paid" },
        { $set: { status: "cancelled", paymentStatus: "refunded" } },
        { new: true, session: txnSession }
      );

      if (paidCancel) {
        const amount = parseNumber(paidCancel.price, 0);
        if (amount > 0) {
          const debit = await UserRepo.updateOne(
            { _id: paidCancel.student, "wallet.escrowBalance": { $gte: amount } },
            { $inc: { "wallet.escrowBalance": -amount } },
            { session: txnSession }
          );
          if (debit.modifiedCount !== 1) throw new Error("SESSION_ESCROW_INSUFFICIENT_FUNDS");

          await UserRepo.updateOne(
            { _id: paidCancel.student },
            { $inc: { "wallet.availableBalance": amount } },
            { session: txnSession }
          );

          await TransactionRepo.create(
            [
              {
                userId: paidCancel.student,
                type: "refund",
                amount,
                status: "completed",
                relatedTo: { model: "Session", id: paidCancel._id },
                metadata: { resolution: "session_cancellation" },
              },
            ],
            { session: txnSession }
          );
        }
        outcome = { didCancel: true, refunded: true, session: paidCancel.toObject() };
        return;
      }

      const unpaidCancel = await SessionRepo.findOneAndUpdate(
        { _id: sessionId, status: { $in: ["pending_payment", "scheduled"] }, paymentStatus: { $ne: "paid" } },
        { $set: { status: "cancelled" } },
        { new: true, session: txnSession }
      );
      if (unpaidCancel) {
        outcome = { didCancel: true, refunded: false, session: unpaidCancel.toObject() };
      } else {
        outcome = { didCancel: false, refunded: false, session: null };
      }
    });
  } finally {
    txnSession.endSession();
  }
  return outcome;
};

class SessionPaymentController {
  static completeSession = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid session ID" });
      }
      const session = await SessionModel.findById(id).select("student tutor status");
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
      }
      const isParticipant =
        session.student.toString() === userId.toString() ||
        session.tutor.toString() === userId.toString();
      if (!isParticipant && !req.user.roles?.includes("admin")) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      let outcome;
      try {
        outcome = await releaseSessionEscrow({ sessionId: id });
      } catch (releaseError) {
        if (releaseError.message === "SESSION_ESCROW_INSUFFICIENT_FUNDS") {
          return res.status(409).json({
            success: false,
            message: "Escrow funds are unavailable for release on this session",
          });
        }
        throw releaseError;
      }

      if (!outcome.didComplete) {
        const current = await SessionModel.findById(id).lean();
        return res.status(200).json({
          success: true,
          message: "Session already completed",
          data: { sessionId: id, status: current?.status },
        });
      }
      return res.status(200).json({
        success: true,
        message: "Session completed and payment released",
        data: { sessionId: id, status: "completed" },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Unable to complete session" });
    }
  };

  static cancelSession = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid session ID" });
      }
      const session = await SessionModel.findById(id).select("student tutor status");
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
      }
      const isParticipant =
        session.student.toString() === userId.toString() ||
        session.tutor.toString() === userId.toString();
      if (!isParticipant && !req.user.roles?.includes("admin")) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      let outcome;
      try {
        outcome = await refundSessionEscrow({ sessionId: id });
      } catch (refundError) {
        if (refundError.message === "SESSION_ESCROW_INSUFFICIENT_FUNDS") {
          return res.status(409).json({
            success: false,
            message: "Escrow funds are unavailable for refund on this session",
          });
        }
        throw refundError;
      }

      if (!outcome.didCancel) {
        const current = await SessionModel.findById(id).lean();
        return res.status(200).json({
          success: true,
          message: "Session already finalized",
          data: { sessionId: id, status: current?.status },
        });
      }
      return res.status(200).json({
        success: true,
        message: outcome.refunded ? "Session cancelled and payment refunded" : "Session cancelled",
        data: { sessionId: id, status: "cancelled", refunded: outcome.refunded },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Unable to cancel session" });
    }
  };

  static verifySessionPayment = async (req, res) => {
    try {
      const invoiceId =
        sanitizeText(req.query?.invoice_id) ||
        sanitizeText(req.body?.invoice_id) ||
        sanitizeText(req.query?.invoiceId) ||
        sanitizeText(req.body?.invoiceId);
      if (!invoiceId) {
        return res.status(400).json({ status: "failed", message: "Invoice ID is required" });
      }
      const result = await verifyAndApplySessionPayment({
        invoiceId,
        source: "manual_verify",
        app: req.app,
      });
      return res.status(200).json({
        status: "success",
        message: "Payment verification completed",
        data: { sessionId: result.sessionId, paymentState: result.paymentState },
      });
    } catch (error) {
      return res.status(500).json({ status: "failed", message: error?.message || "Unable to verify payment" });
    }
  };

  static handleSessionPaymentCallback = async (req, res) => {
    const invoiceId =
      extractInvoiceIdFromValue(req.query?.invoice_id) ||
      extractInvoiceIdFromValue(req.query?.invoiceId) ||
      extractInvoiceIdFromValue(req.query);
    let sessionId = sanitizeText(req.query?.session_id);
    let paymentState = "failed";
    try {
      if (!invoiceId) throw new Error("Invoice ID is missing in callback");
      const result = await verifyAndApplySessionPayment({
        invoiceId,
        source: "gateway_redirect",
        app: req.app,
      });
      sessionId = result.sessionId || sessionId;
      paymentState = result.paymentState || "failed";
    } catch (error) {
      paymentState = "failed";
    }
    return res.redirect(buildSessionRedirectUrl({ sessionId, paymentState, invoiceId }));
  };

  static handleSessionPaymentCancel = async (req, res) => {
    const invoiceId =
      extractInvoiceIdFromValue(req.query?.invoice_id) ||
      extractInvoiceIdFromValue(req.query?.invoiceId) ||
      "";
    let sessionId = sanitizeText(req.query?.session_id);
    if (!sessionId && invoiceId) sessionId = await findSessionIdByInvoiceId(invoiceId);

    if (sessionId) {
      await SessionModel.updateOne(
        { _id: sessionId, status: "pending_payment" },
        { $set: { status: "cancelled", "paymentGateway.status": "cancelled" } }
      );
      const txFilter = {
        type: "escrow_hold",
        "relatedTo.model": "Session",
        "relatedTo.id": sessionId,
        status: "pending",
      };
      if (invoiceId) {
        txFilter.$or = [{ gatewayId: invoiceId }, { "metadata.invoiceId": invoiceId }];
      }
      await TransactionModel.updateMany(txFilter, {
        $set: { status: "cancelled", "metadata.cancellationSource": "gateway_redirect" },
      });
    }
    return res.redirect(buildSessionRedirectUrl({ sessionId, paymentState: "cancelled", invoiceId }));
  };

  static handleSessionPaymentWebhook = async (req, res) => {
    try {
      if (!isValidUddoktaWebhookRequest(req)) {
        return res.status(401).json({ status: "failed", message: "Invalid webhook signature" });
      }
      const invoiceId =
        extractInvoiceIdFromValue(req.body?.invoice_id) ||
        extractInvoiceIdFromValue(req.body?.invoiceId) ||
        extractInvoiceIdFromValue(req.body);
      if (!invoiceId) {
        return res.status(400).json({ status: "failed", message: "Invoice ID is required" });
      }
      const result = await verifyAndApplySessionPayment({
        invoiceId,
        source: "gateway_webhook",
        app: req.app,
      });
      return res.status(200).json({
        status: "success",
        message: "Webhook processed",
        data: { sessionId: result.sessionId, paymentState: result.paymentState },
      });
    } catch (error) {
      return res.status(500).json({ status: "failed", message: error?.message || "Unable to process webhook" });
    }
  };

  static handleSessionMockGateway = async (req, res) => {
    if (!isUddoktaMockModeEnabled()) {
      return res.status(404).send("Mock payment mode is disabled");
    }
    const sessionId = sanitizeText(req.query?.session_id);
    const invoiceId =
      extractInvoiceIdFromValue(req.query?.invoice_id) ||
      extractInvoiceIdFromValue(req.query?.invoiceId) ||
      "";
    const method = normalizeMockPaymentMethod(req.query?.method);
    if (!sessionId || !invoiceId) {
      return res.status(400).send("session_id and invoice_id are required");
    }
    const backendBaseUrl = getBackendBaseUrl(req);
    const successUrl = buildSessionMockStatusUrl({ backendBaseUrl, sessionId, invoiceId, method, status: "COMPLETED" });
    const failedUrl = buildSessionMockStatusUrl({ backendBaseUrl, sessionId, invoiceId, method, status: "FAILED" });
    const cancelUrl = new URL(`${backendBaseUrl}/api/sessions/payment/cancel`);
    cancelUrl.searchParams.set("session_id", sessionId);
    cancelUrl.searchParams.set("invoice_id", invoiceId);

    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Mock UddoktaPay (Session)</title><style>body{font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;color:#1f2937}.card{max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px}.row{display:flex;gap:10px;flex-wrap:wrap}a.btn{display:inline-block;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:600}.ok{background:#16a34a;color:#fff}.fl{background:#dc2626;color:#fff}.cl{background:#6b7280;color:#fff}code{background:#f3f4f6;padding:2px 6px;border-radius:6px}</style></head><body><div class="card"><h2>Mock UddoktaPay Checkout (Session)</h2><p>Method: <code>${method}</code> | Invoice: <code>${invoiceId}</code></p><div class="row"><a class="btn ok" href="${successUrl}">Success</a><a class="btn fl" href="${failedUrl}">Failed</a><a class="btn cl" href="${cancelUrl.toString()}">Cancel</a></div></div></body></html>`;
    return res.status(200).send(html);
  };

  static handleSessionMockComplete = async (req, res) => {
    if (!isUddoktaMockModeEnabled()) {
      return res.status(404).send("Mock payment mode is disabled");
    }
    const invoiceId =
      extractInvoiceIdFromValue(req.query?.invoice_id) ||
      extractInvoiceIdFromValue(req.query?.invoiceId) ||
      "";
    const sessionId = sanitizeText(req.query?.session_id);
    const method = normalizeMockPaymentMethod(req.query?.method);
    const status = sanitizeText(req.query?.status || "COMPLETED").toUpperCase();
    let redirectSessionId = sessionId;
    let paymentState = "failed";

    try {
      if (!invoiceId || !sessionId) throw new Error("session_id and invoice_id are required");
      const session = await SessionModel.findById(sessionId).select("price").lean();
      const amount = parseNumber(session?.price, 0);
      const result = await verifyAndApplySessionPayment({
        invoiceId,
        source: "mock_gateway_redirect",
        app: req.app,
        deps: {
          verifyPaymentFn: async (incomingInvoiceId) =>
            getMockVerificationResponse({ invoiceId: incomingInvoiceId, sessionId, amount, method, status }),
        },
      });
      redirectSessionId = result.sessionId || redirectSessionId;
      paymentState = result.paymentState || "failed";
    } catch (error) {
      paymentState = "failed";
    }
    return res.redirect(buildSessionRedirectUrl({ sessionId: redirectSessionId, paymentState, invoiceId }));
  };
}

export const __verifyAndApplySessionPaymentForTest = verifyAndApplySessionPayment;
export const __releaseSessionEscrowForTest = releaseSessionEscrow;
export const __refundSessionEscrowForTest = refundSessionEscrow;
export default SessionPaymentController;
