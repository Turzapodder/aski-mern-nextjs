'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  ArrowRight,
  ArrowLeft,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Bookmark,
  Loader2,
  ShieldCheck,
  ChevronRight,
  XCircle,
} from 'lucide-react';

type BankDetails = {
  paymentMethod: 'bank' | 'mobile_banking' | 'card';
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  routingNumber: string;
  provider: string;
  mobileNumber: string;
  accountType: string;
  cardholderName: string;
  cardNumber: string;
  cardType: string;
};

type WithdrawModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
  bankDetails?: Partial<BankDetails>;
  onSuccess?: () => void;
};

const MIN_WITHDRAWAL = 500;

const formatAmount = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

const maskValue = (val: string) => {
  const trimmed = val.trim();
  if (trimmed.length <= 4) return trimmed;
  return `•••• ${trimmed.slice(-4)}`;
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

const inputCx =
  'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';
const selectCx =
  'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';
const labelCx = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5';

const METHODS = [
  { id: 'bank' as const, label: 'Bank', icon: Banknote },
  { id: 'mobile_banking' as const, label: 'Mobile', icon: Smartphone },
  { id: 'card' as const, label: 'Card', icon: CreditCard },
];

const getAvailableSavedMethods = (bd: Partial<BankDetails> | undefined) => {
  const available: Array<'bank' | 'mobile_banking' | 'card'> = [];
  if (bd?.accountName && bd?.accountNumber && bd?.bankName) available.push('bank');
  if (bd?.provider && bd?.mobileNumber) available.push('mobile_banking');
  if (bd?.cardholderName && bd?.cardNumber) available.push('card');
  return available;
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
  
  // useSaved can be:
  // false = manual entry
  // 'selecting' = user clicked "Use saved info" but has multiple, asking to choose
  // 'bank' | 'mobile_banking' | 'card' = selected saved method
  const [useSaved, setUseSaved] = useState<false | 'selecting' | 'bank' | 'mobile_banking' | 'card'>(false);
  const [confirmBank, setConfirmBank] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setAmount('');
      setDetails({ ...emptyDetails });
      setUseSaved(false);
      setConfirmBank(false);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const parsedAmount = useMemo(() => Number(amount), [amount]);

  const validateAmount = () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return 'Enter a valid amount';
    if (parsedAmount > availableBalance) return 'Exceeds available balance';
    if (parsedAmount < MIN_WITHDRAWAL) return `Minimum withdrawal is ${MIN_WITHDRAWAL} BDT`;
    return null;
  };

  const validateBankDetails = () => {
    if (details.paymentMethod === 'bank') {
      if (!details.accountName?.trim() || !details.accountNumber?.trim() || !details.bankName?.trim()) {
        return 'Please fill all bank details';
      }
    } else if (details.paymentMethod === 'mobile_banking') {
      if (!details.provider?.trim() || !details.mobileNumber?.trim()) {
        return 'Please fill all mobile banking details';
      }
    } else if (details.paymentMethod === 'card') {
      if (!details.cardholderName?.trim() || !details.cardNumber?.trim()) {
        return 'Please fill all card details';
      }
    }
    if (!confirmBank) return 'Please confirm the payout details';
    return null;
  };

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      const err = validateAmount();
      if (err) { setError(err); return; }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (useSaved === 'selecting') {
        setError('Please select a saved payment method, or fill manually.');
        return;
      }
      const err = validateBankDetails();
      if (err) { setError(err); return; }
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
          body: JSON.stringify({ amount: parsedAmount, bankDetails: details }),
        });
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.error || 'Withdrawal failed');
        }
        toast.success(result?.message || 'Withdrawal request submitted successfully.');
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

  const handleUseSavedClick = () => {
    if (useSaved) {
      // Toggle off
      setUseSaved(false);
      setConfirmBank(false);
      setDetails({ ...emptyDetails, paymentMethod: details.paymentMethod });
      return;
    }

    const available = getAvailableSavedMethods(bankDetails);
    
    if (available.length === 0) {
      toast.error('No info is stored. Please fill manually.');
      setUseSaved(false);
    } else if (available.length === 1) {
      // Only 1 saved method, auto select it
      const method = available[0];
      setUseSaved(method);
      setDetails({ ...emptyDetails, ...bankDetails, paymentMethod: method } as BankDetails);
      setConfirmBank(true);
      toast.success(`Loaded saved ${method.replace('_', ' ')} info`);
    } else {
      // Multiple saved methods, let user choose
      setUseSaved('selecting');
    }
  };

  const selectSavedMethod = (method: 'bank' | 'mobile_banking' | 'card') => {
    setUseSaved(method);
    setDetails({ ...emptyDetails, ...bankDetails, paymentMethod: method } as BankDetails);
    setConfirmBank(true);
    toast.success(`Loaded saved ${method.replace('_', ' ')} info`);
  };

  const fieldDisabled = useSaved !== false && useSaved !== 'selecting';
  const availableMethods = getAvailableSavedMethods(bankDetails);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Progress Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? 'bg-black' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {step === 1 && 'Enter Amount'}
            {step === 2 && 'Payment Details'}
            {step === 3 && 'Review & Confirm'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {step === 1 && 'How much would you like to withdraw?'}
            {step === 2 && 'Where should we send the funds?'}
            {step === 3 && 'Please review everything before confirming.'}
          </p>
        </div>

        <div className="px-6 pb-6">
          {/* ── Step 1: Amount ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">৳</div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-400">
                  Available: <span className="font-semibold text-gray-600">{formatAmount(availableBalance)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAmount(String(availableBalance))}
                  className="text-xs font-bold text-black hover:text-gray-600 transition-colors"
                >
                  Withdraw all
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Minimum withdrawal is <span className="font-semibold text-gray-600">৳{MIN_WITHDRAWAL}</span>. Processing takes 3-5 business days.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Payment Details ───────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Use Saved Info Button (Top) */}
              <button
                type="button"
                onClick={handleUseSavedClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  useSaved
                    ? 'border-black bg-black/5'
                    : 'border-dashed border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                  useSaved && useSaved !== 'selecting' ? 'border-black bg-black' : 'border-gray-300'
                }`}>
                  {useSaved && useSaved !== 'selecting' && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-bold text-gray-900">Use saved bank info</span>
                  <span className="block text-[11px] text-gray-400">Load details from your profile</span>
                </div>
                {useSaved ? (
                  <XCircle className="w-4 h-4 text-gray-400 hover:text-black transition-colors" />
                ) : (
                  <Bookmark className="w-4 h-4 text-gray-300 transition-colors" />
                )}
              </button>

              {/* Multiple Options Selector */}
              {useSaved === 'selecting' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-gray-600 mb-2 px-1">Select saved method to use:</p>
                  {availableMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => selectSavedMethod(method)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-black transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        {method === 'bank' && <Banknote className="w-4 h-4 text-gray-500 group-hover:text-black" />}
                        {method === 'mobile_banking' && <Smartphone className="w-4 h-4 text-gray-500 group-hover:text-black" />}
                        {method === 'card' && <CreditCard className="w-4 h-4 text-gray-500 group-hover:text-black" />}
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-black capitalize">
                          {method === 'bank' ? bankDetails?.bankName : 
                           method === 'mobile_banking' ? bankDetails?.provider : 
                           `${bankDetails?.cardType} Card`}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black" />
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Or fill manually
                  </span>
                </div>
              </div>

              {/* Method Selector */}
              <div className="flex gap-2">
                {METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setDetails((prev) => ({ ...prev, paymentMethod: id }));
                      if (useSaved && useSaved !== id) {
                        setUseSaved(false);
                        setConfirmBank(false);
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      details.paymentMethod === id
                        ? 'bg-black text-white shadow-md'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                {details.paymentMethod === 'bank' && (
                  <>
                    <div className="grid gap-3 grid-cols-2">
                      <div className="col-span-2">
                        <label className={labelCx}>Account Name</label>
                        <input
                          type="text"
                          value={details.accountName}
                          onChange={(e) => setDetails((p) => ({ ...p, accountName: e.target.value }))}
                          disabled={fieldDisabled}
                          placeholder="e.g. John Doe"
                          className={inputCx}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCx}>Account Number</label>
                        <input
                          type="text"
                          value={details.accountNumber}
                          onChange={(e) => setDetails((p) => ({ ...p, accountNumber: e.target.value }))}
                          disabled={fieldDisabled}
                          placeholder="e.g. 1234567890"
                          className={inputCx}
                        />
                      </div>
                      <div>
                        <label className={labelCx}>Bank Name</label>
                        <input
                          type="text"
                          value={details.bankName}
                          onChange={(e) => setDetails((p) => ({ ...p, bankName: e.target.value }))}
                          disabled={fieldDisabled}
                          placeholder="e.g. DBBL"
                          className={inputCx}
                        />
                      </div>
                      <div>
                        <label className={labelCx}>Branch</label>
                        <input
                          type="text"
                          value={details.branchName}
                          onChange={(e) => setDetails((p) => ({ ...p, branchName: e.target.value }))}
                          disabled={fieldDisabled}
                          placeholder="e.g. Banani"
                          className={inputCx}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCx}>Routing Number</label>
                        <input
                          type="text"
                          value={details.routingNumber}
                          onChange={(e) => setDetails((p) => ({ ...p, routingNumber: e.target.value }))}
                          disabled={fieldDisabled}
                          placeholder="e.g. 090261984"
                          className={inputCx}
                        />
                      </div>
                    </div>
                  </>
                )}

                {details.paymentMethod === 'mobile_banking' && (
                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <label className={labelCx}>Provider</label>
                      <select
                        value={details.provider}
                        onChange={(e) => setDetails((p) => ({ ...p, provider: e.target.value }))}
                        disabled={fieldDisabled}
                        className={selectCx}
                      >
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Upay">Upay</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCx}>Account Type</label>
                      <select
                        value={details.accountType}
                        onChange={(e) => setDetails((p) => ({ ...p, accountType: e.target.value }))}
                        disabled={fieldDisabled}
                        className={selectCx}
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                        <option value="Merchant">Merchant</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className={labelCx}>Mobile Number</label>
                      <input
                        type="text"
                        value={details.mobileNumber}
                        onChange={(e) => setDetails((p) => ({ ...p, mobileNumber: e.target.value }))}
                        disabled={fieldDisabled}
                        placeholder="e.g. 017XXXXXXXX"
                        className={inputCx}
                      />
                    </div>
                  </div>
                )}

                {details.paymentMethod === 'card' && (
                  <div className="grid gap-3">
                    <div>
                      <label className={labelCx}>Card Type</label>
                      <select
                        value={details.cardType}
                        onChange={(e) => setDetails((p) => ({ ...p, cardType: e.target.value }))}
                        disabled={fieldDisabled}
                        className={selectCx}
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="AMEX">American Express</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCx}>Cardholder Name</label>
                      <input
                        type="text"
                        value={details.cardholderName}
                        onChange={(e) => setDetails((p) => ({ ...p, cardholderName: e.target.value }))}
                        disabled={fieldDisabled}
                        placeholder="e.g. John Doe"
                        className={inputCx}
                      />
                    </div>
                    <div>
                      <label className={labelCx}>Card Number</label>
                      <input
                        type="text"
                        value={details.cardNumber}
                        onChange={(e) => setDetails((p) => ({ ...p, cardNumber: e.target.value }))}
                        disabled={fieldDisabled}
                        placeholder="e.g. 4321 0987 6543 2109"
                        className={inputCx}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Checkbox */}
              <label className={`flex items-center gap-2.5 px-1 py-1 cursor-pointer select-none ${useSaved ? 'opacity-60' : ''}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  confirmBank ? 'border-black bg-black' : 'border-gray-300'
                }`}>
                  {confirmBank && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={confirmBank}
                  onChange={(e) => setConfirmBank(e.target.checked)}
                  disabled={!!useSaved}
                  className="sr-only"
                />
                <span className="text-xs text-gray-600">I confirm these payment details are correct</span>
              </label>
            </div>
          )}

          {/* ── Step 3: Review ────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</span>
                  <span className="text-lg font-bold text-gray-900">{formatAmount(parsedAmount || 0)}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Method</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">{details.paymentMethod.replace('_', ' ')}</span>
                </div>

                {details.paymentMethod === 'bank' && (
                  <>
                    <div className="h-px bg-gray-200" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Account</span>
                        <span className="font-medium text-gray-900">{maskValue(details.accountNumber)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bank</span>
                        <span className="font-medium text-gray-900">{details.bankName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium text-gray-900">{details.accountName}</span>
                      </div>
                    </div>
                  </>
                )}

                {details.paymentMethod === 'mobile_banking' && (
                  <>
                    <div className="h-px bg-gray-200" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Number</span>
                        <span className="font-medium text-gray-900">{maskValue(details.mobileNumber)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Provider</span>
                        <span className="font-medium text-gray-900">{details.provider} ({details.accountType})</span>
                      </div>
                    </div>
                  </>
                )}

                {details.paymentMethod === 'card' && (
                  <>
                    <div className="h-px bg-gray-200" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Card</span>
                        <span className="font-medium text-gray-900">{maskValue(details.cardNumber)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type</span>
                        <span className="font-medium text-gray-900">{details.cardType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium text-gray-900">{details.cardholderName}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  This action cannot be undone. Funds will be processed within 3-5 business days after admin approval.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100">
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 mt-5">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                step === 3
                  ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === 3 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Withdrawal
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
