import ChatModel from "../models/Chat.js";

export const enforceChatLock = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    if (!chatId) return next();

    const chat = await ChatModel.findById(chatId).select("isLockedUntil");
    if (!chat) return next();

    // If chat is locked until a future date-time
    if (chat.isLockedUntil && new Date() < new Date(chat.isLockedUntil)) {
      return res.status(403).json({
        success: false,
        code: "CHAT_LOCKED",
        message: `This chat is locked until the session starts at ${chat.isLockedUntil.toISOString()}`,
        unlockAt: chat.isLockedUntil,
      });
    }

    next();
  } catch (error) {
    console.error("Chat gatekeeper error:", error);
    next();
  }
};
