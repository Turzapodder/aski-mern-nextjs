import React from "react";
import { CreditCard, Shield } from "lucide-react";
import { Assignment, useProcessPaymentMutation } from "@/lib/services/assignments";
import { toast } from "sonner";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

interface PaymentComponentProps {
  assignment: Assignment;
  onPaymentComplete?: (assignment: Assignment) => void;
  currency?: string;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  assignment,
  onPaymentComplete,
  currency,
}) => {
  const activeCurrency = currency || DEFAULT_CURRENCY;
  const formatAmount = (value?: number) => formatCurrency(value, activeCurrency);
  const paymentAmount =
    assignment.paymentAmount ?? assignment.budget ?? assignment.estimatedCost ?? 0;
  const isPaid = assignment.paymentStatus === "paid";
  const [processPayment, { isLoading }] = useProcessPaymentMutation();

  const handlePayNow = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    try {
      const result = await processPayment({
        id: assignment._id,
        amount: paymentAmount,
        method: "uddoktapay",
      }).unwrap();

      const checkoutUrl = result?.data?.checkoutUrl;
      if (!checkoutUrl) {
        toast.error("Payment link not available. Please try again.");
        return;
      }

      toast.success("Redirecting to UddoktaPay...");
      if (onPaymentComplete) {
        onPaymentComplete(assignment);
      }
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to initialize payment");
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>
      {isPaid && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Payment already completed. You can proceed to the submission stage.
        </div>
      )}

      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Assignment fee</span>
          <span className="font-medium">{formatAmount(paymentAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Gateway fee</span>
          <span className="font-medium">Calculated by UddoktaPay</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>{formatAmount(paymentAmount)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-4">
        <Shield size={16} className="text-primary-500" />
        <span>You will complete payment securely on UddoktaPay</span>
      </div>

      <button
        type="button"
        onClick={handlePayNow}
        disabled={isLoading || isPaid}
        className="w-full mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <CreditCard size={18} />
        <span>{isLoading ? "Initializing..." : "Continue to Payment"}</span>
      </button>
    </div>
  );
};

export default PaymentComponent;
