import { useGetUserQuery } from "@/lib/services/auth";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

export const useCurrency = (overrideCurrency?: string) => {
  const { data: userData } = useGetUserQuery();
  const currency =
    overrideCurrency || userData?.user?.wallet?.currency || DEFAULT_CURRENCY;

  const format = (amount?: number | string) => formatCurrency(amount, currency);

  return { currency, format };
};

export default useCurrency;
