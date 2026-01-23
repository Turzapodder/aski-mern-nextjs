import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "deposit",
        "withdrawal",
        "escrow_hold",
        "escrow_release",
        "platform_fee",
        "refund",
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value) => Number.isFinite(value) && value > 0,
        message: "Amount must be greater than 0",
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    gatewayId: {
      type: String,
      trim: true,
    },
    relatedTo: {
      model: {
        type: String,
        trim: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

transactionSchema.virtual("statusBadge").get(function () {
  const statusColors = {
    pending: "#f59e0b",
    completed: "#10b981",
    failed: "#ef4444",
    cancelled: "#94a3b8",
  };

  return statusColors[this.status] || "#64748b";
});

transactionSchema.virtual("typeLabel").get(function () {
  const labels = {
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    escrow_hold: "Escrow Hold",
    escrow_release: "Escrow Release",
    platform_fee: "Platform Fee",
    refund: "Refund",
  };

  return labels[this.type] || "Transaction";
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

const TransactionModel = mongoose.model("transaction", transactionSchema);

export default TransactionModel;
