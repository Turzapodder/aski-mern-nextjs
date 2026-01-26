import React from 'react';
import { CreditCard, Shield } from 'lucide-react';
import { Assignment, useProcessPaymentMutation } from '@/lib/services/assignments';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface PaymentComponentProps {
  assignment: Assignment;
  onPaymentComplete?: (assignment: Assignment) => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({ assignment, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = React.useState<string>('credit_card');
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardName, setCardName] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [processPayment, { isLoading }] = useProcessPaymentMutation();
  const paymentAmount = assignment.paymentAmount ?? assignment.budget ?? assignment.estimatedCost ?? 0;
  const isPaid = assignment.paymentStatus === 'paid';
  
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: <CreditCard size={20} />
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <span className="text-[#0070ba] font-bold">P</span>
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: <span className="text-primary-500 font-bold">B</span>
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }

    try {
      const result = await processPayment({
        id: assignment._id,
        amount: paymentAmount,
        method: selectedMethod,
      }).unwrap();
      toast.success('Payment completed');
      if (result?.data && onPaymentComplete) {
        onPaymentComplete(result.data);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
      {isPaid && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Payment already completed. You can proceed to the submission stage.
        </div>
      )}
      
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</div>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border ${selectedMethod === method.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                {method.icon}
              </div>
              <span className="text-sm font-medium">{method.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {selectedMethod === 'credit_card' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                  required
                />
              </div>
            </div>
          </>
        )}

        {selectedMethod === 'paypal' && (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-700 mb-4">You will be redirected to PayPal to complete your payment.</p>
            <div className="text-[#0070ba] font-bold text-2xl mb-2">PayPal</div>
          </div>
        )}

        {selectedMethod === 'bank_transfer' && (
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-700 mb-4">Please use the following details to make your bank transfer:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Bank Name:</span>
                <span>International Bank</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Account Name:</span>
                <span>Aski Education</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Account Number:</span>
                <span>1234567890</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Reference:</span>
                <span>ASK-12345</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-4">
          <Shield size={16} className="text-primary-500" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <div className="pt-4 border-t border-gray-200 mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Assignment Fee:</span>
            <span className="font-medium">${paymentAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Service Fee:</span>
            <span className="font-medium">$0.00</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>${paymentAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isPaid}
          className="w-full mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <CreditCard size={18} />
          <span>{isLoading ? 'Processing...' : 'Pay Now'}</span>
        </button>
      </form>
    </div>
  );
};

export default PaymentComponent;
