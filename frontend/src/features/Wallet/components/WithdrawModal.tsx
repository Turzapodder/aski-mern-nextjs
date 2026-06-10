'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BankDetails = {
  paymentMethod: 'bank' | 'mobile_banking' | 'card';
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  routingNumber: string;
  provider: string; // e.g., 'bKash', 'Nagad'
  mobileNumber: string;
  accountType: string; // e.g., 'Personal', 'Agent'
  cardholderName: string;
  cardNumber: string;
  cardType: string; // e.g., 'Visa', 'Mastercard'
};

type WithdrawModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
  bankDetails?: Partial<BankDetails>;
  onSuccess?: () => void;
};

const MIN_WITHDRAWAL = 500;

const formatAmount = (amount: number) => `BDT ${amount.toFixed(2)}`;

const maskAccountNumber = (accountNumber: string) => {
  const trimmed = accountNumber.trim();
  if (trimmed.length <= 4) return trimmed;
  return `****${trimmed.slice(-4)}`;
};

const emptyDetails: BankDetails = {
  paymentMethod: 'bank',
  accountName: '',
  accountNumber: '',
  bankName: '',
  branchName: '',
  routingNumber: '',
  provider: 'bKash',
  mobileNumber: '',
  accountType: 'Personal',
  cardholderName: '',
  cardNumber: '',
  cardType: 'Visa',
};

export default function WithdrawModal({
  open,
  onOpenChange,
  availableBalance,
  bankDetails,
  onSuccess,
}: WithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState<BankDetails>(emptyDetails);
  const [confirmBank, setConfirmBank] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setAmount('');
      setDetails({ ...emptyDetails, ...bankDetails });
      setConfirmBank(false);
      setError(null);
      setSubmitting(false);
    }
  }, [open, bankDetails]);

  const parsedAmount = useMemo(() => Number(amount), [amount]);

  const validateAmount = () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return 'Amount must be greater than 0';
    }
    if (parsedAmount > availableBalance) {
      return 'Amount cannot exceed available balance';
    }
    if (parsedAmount < MIN_WITHDRAWAL) {
      return `Minimum withdrawal is ${MIN_WITHDRAWAL} BDT`;
    }
    return null;
  };

  const validateBankDetails = () => {
    if (details.paymentMethod === 'bank') {
      const requiredFields: Array<keyof BankDetails> = [
        'accountName',
        'accountNumber',
        'bankName',
        'branchName',
        'routingNumber',
      ];
      const missingField = requiredFields.find((field) => !details[field]?.toString().trim());
      if (missingField) {
        return 'All bank details are required';
      }
    } else if (details.paymentMethod === 'mobile_banking') {
      const requiredFields: Array<keyof BankDetails> = [
        'provider',
        'mobileNumber',
        'accountType',
      ];
      const missingField = requiredFields.find((field) => !details[field]?.toString().trim());
      if (missingField) {
        return 'All mobile banking details are required';
      }
    } else if (details.paymentMethod === 'card') {
      const requiredFields: Array<keyof BankDetails> = [
        'cardholderName',
        'cardNumber',
        'cardType',
      ];
      const missingField = requiredFields.find((field) => !details[field]?.toString().trim());
      if (missingField) {
        return 'All card details are required';
      }
    }

    if (!confirmBank) {
      return 'Please confirm the payout details';
    }
    return null;
  };

  const handleNext = async () => {
    setError(null);

    if (step === 1) {
      const amountError = validateAmount();
      if (amountError) {
        setError(amountError);
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      const bankError = validateBankDetails();
      if (bankError) {
        setError(bankError);
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      setSubmitting(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`${baseUrl}/api/wallet/withdraw`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: parsedAmount,
            bankDetails: details,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.error || 'Withdrawal failed');
        }

        toast.success(
          result?.message || 'Withdrawal request submitted. Funds are on hold pending admin approval.'
        );
        onSuccess?.();
        onOpenChange(false);
      } catch (submitError: any) {
        setError(submitError?.message || 'Withdrawal failed');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Withdraw Balance'}
            {step === 2 && 'Confirm Payment Details'}
            {step === 3 && 'Review & Confirm'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  BDT
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="pl-12"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Available balance: {formatAmount(availableBalance)} (Min. withdrawal: 500 BDT)
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Withdrawal Method</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['bank', 'mobile_banking', 'card'] as const).map((method) => (
                  <Button
                    key={method}
                    type="button"
                    variant={details.paymentMethod === method ? 'default' : 'outline'}
                    onClick={() =>
                      setDetails((prev) => ({
                        ...prev,
                        paymentMethod: method,
                      }))
                    }
                    className="capitalize text-xs font-semibold py-2 h-auto"
                  >
                    {method.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              {details.paymentMethod === 'bank' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={details.accountName}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          accountName: event.target.value,
                        }))
                      }
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={details.accountNumber}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          accountNumber: event.target.value,
                        }))
                      }
                      placeholder="e.g. 1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={details.bankName}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          bankName: event.target.value,
                        }))
                      }
                      placeholder="e.g. Dutch Bangla Bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input
                      id="branchName"
                      value={details.branchName}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          branchName: event.target.value,
                        }))
                      }
                      placeholder="e.g. Banani Branch"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={details.routingNumber}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          routingNumber: event.target.value,
                        }))
                      }
                      placeholder="e.g. 090261984"
                    />
                  </div>
                </div>
              )}

              {details.paymentMethod === 'mobile_banking' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <select
                      id="provider"
                      value={details.provider}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          provider: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <select
                      id="accountType"
                      value={details.accountType}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          accountType: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Agent">Agent</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      value={details.mobileNumber}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          mobileNumber: event.target.value,
                        }))
                      }
                      placeholder="e.g. 01700000000"
                    />
                  </div>
                </div>
              )}

              {details.paymentMethod === 'card' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      value={details.cardholderName}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          cardholderName: event.target.value,
                        }))
                      }
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={details.cardNumber}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          cardNumber: event.target.value,
                        }))
                      }
                      placeholder="e.g. 4321 0987 6543 2109"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="cardType">Card Type</Label>
                    <select
                      id="cardType"
                      value={details.cardType}
                      onChange={(event) =>
                        setDetails((prev) => ({
                          ...prev,
                          cardType: event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">American Express</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 mt-4">
              <input
                type="checkbox"
                checked={confirmBank}
                onChange={(event) => setConfirmBank(event.target.checked)}
              />
              I confirm these details are correct
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-gray-50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Withdrawal amount</span>
                <span className="font-semibold">{formatAmount(parsedAmount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Method</span>
                <span className="font-semibold uppercase">{details.paymentMethod.replace('_', ' ')}</span>
              </div>

              {details.paymentMethod === 'bank' && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Account number</span>
                    <span className="font-semibold">{maskAccountNumber(details.accountNumber)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bank name</span>
                    <span className="font-semibold">{details.bankName}</span>
                  </div>
                </>
              )}

              {details.paymentMethod === 'mobile_banking' && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mobile Number</span>
                    <span className="font-semibold">{maskAccountNumber(details.mobileNumber)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Provider</span>
                    <span className="font-semibold">{details.provider} ({details.accountType})</span>
                  </div>
                </>
              )}

              {details.paymentMethod === 'card' && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Card Number</span>
                    <span className="font-semibold">{maskAccountNumber(details.cardNumber)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Card Type</span>
                    <span className="font-semibold">{details.cardType}</span>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              This action cannot be undone. The amount will be processed within 3-5 business days.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-2 pt-2">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={submitting}>
              Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={handleNext} disabled={submitting}>
            {step === 3 ? 'Confirm Withdrawal' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
