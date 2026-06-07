import { useEffect, useMemo, useState } from 'react';
import { useGetUserQuery } from '@/lib/services/auth';

export type WithdrawalEntry = {
  _id?: string;
  transactionId?: string;
  amount?: number;
  status?: string;
  requestedAt?: string;
  completedAt?: string;
};

export const formatAmount = (amount: number) => `BDT ${amount.toFixed(2)}`;

export const CREDIT_TX_TYPES = ['escrow_release', 'deposit', 'refund'];

export const txAmountLabel = (item: any) => {
  const isCredit = CREDIT_TX_TYPES.includes(item?.type);
  const amount = Number(item?.amount) || 0;
  return `${isCredit ? '+' : '-'} ${formatAmount(amount)}`;
};

export const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

export const statusClasses: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const useWalletLogic = () => {
  const { data: userData, isLoading: authLoading } = useGetUserQuery();
  const [walletOverview, setWalletOverview] = useState<any>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchWalletOverview = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/wallet/overview`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWalletOverview(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching wallet overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    fetchWalletOverview();
  }, []);

  const refetch = () => {
    setLoadingOverview(true);
    fetchWalletOverview();
  };

  const user = userData?.user;
  const isTutor = user?.roles?.includes('tutor');

  const wallet = walletOverview?.wallet || {
    availableBalance: 0,
    escrowBalance: 0,
    totalEarnings: 0,
    withdrawalHistory: [],
    bankDetails: {},
  };

  const dynamicTransactions = walletOverview?.transactions || [];

  const sortedHistory = useMemo(() => {
    return [...dynamicTransactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [dynamicTransactions]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedHistory = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return sortedHistory.slice(startIndex, startIndex + pageSize);
  }, [currentPage, sortedHistory, totalPages]);

  const pendingWithdrawals = useMemo(
    () =>
      sortedHistory
        .filter((entry) => entry?.status === 'PENDING' && entry?.type === 'withdrawal')
        .slice(0, 3),
    [sortedHistory]
  );

  const weeklyCashflow = walletOverview?.weeklyCashflow || {
    labels: weekLabels,
    earnings: Array(7).fill(0),
    deposits: Array(7).fill(0),
    withdrawals: Array(7).fill(0),
  };

  const maxAmount = Math.max(
    ...weeklyCashflow.earnings,
    ...weeklyCashflow.deposits,
    ...weeklyCashflow.withdrawals,
    100
  );

  const earningsBars = weeklyCashflow.earnings.map((amount: number) =>
    clamp(Math.round((amount / maxAmount) * 100), 20, 120)
  );

  const depositsBars = weeklyCashflow.deposits.map((amount: number) =>
    clamp(Math.round((amount / maxAmount) * 80), 14, 95)
  );

  const snapshotBars = weeklyCashflow.withdrawals.map((amount: number) =>
    clamp(Math.round((amount / maxAmount) * 90), 18, 110)
  );

  const canWithdraw = Boolean(isTutor) && wallet.availableBalance > 0;
  const isLoading = authLoading || loadingOverview;

  return {
    userData,
    isLoading,
    refetch,
    isModalOpen,
    setIsModalOpen,
    currentPage,
    setCurrentPage,
    user,
    isTutor,
    wallet,
    sortedHistory,
    totalPages,
    pagedHistory,
    pendingWithdrawals,
    earningsBars,
    depositsBars,
    snapshotBars,
    canWithdraw,
  };
};
