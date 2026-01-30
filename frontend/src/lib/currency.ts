export const DEFAULT_CURRENCY = "BDT";

const normalizeAmount = (amount?: number | string) => {
  if (amount === null || amount === undefined || amount === "") return 0;
  const value = typeof amount === "string" ? Number(amount) : amount;
  return Number.isFinite(value) ? value : 0;
};

export const formatCurrency = (
  amount?: number | string,
  currency: string = DEFAULT_CURRENCY
) => {
  const value = normalizeAmount(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    return `${currency} ${value.toFixed(2)}`;
  }
};
