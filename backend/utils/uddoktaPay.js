const API_KEY_HEADER = "RT-UDDOKTAPAY-API-KEY";
const DEFAULT_TIMEOUT_MS = 30_000;

export const normalizeUddoktaBaseUrl = (value) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const prefixed = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return prefixed.replace(/\/+$/, "");
};

export const getUddoktaConfig = () => {
  const baseUrl = normalizeUddoktaBaseUrl(process.env.UDDOKTAPAY_BASE_URL || "");
  const apiKey = (process.env.UDDOKTAPAY_API_KEY || "").trim();
  const webhookApiKey = (
    process.env.UDDOKTAPAY_WEBHOOK_API_KEY ||
    process.env.UDDOKTAPAY_API_KEY ||
    ""
  ).trim();

  return {
    baseUrl,
    apiKey,
    webhookApiKey,
  };
};

export const isUddoktaConfigured = () => {
  const { baseUrl, apiKey } = getUddoktaConfig();
  return Boolean(baseUrl && apiKey);
};

const assertUddoktaConfig = () => {
  if (!isUddoktaConfigured()) {
    throw new Error("UddoktaPay is not configured");
  }
};

const parseJsonSafely = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const requestUddokta = async (path, payload) => {
  assertUddoktaConfig();
  const { baseUrl, apiKey } = getUddoktaConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [API_KEY_HEADER]: apiKey,
      },
      body: JSON.stringify(payload || {}),
      signal: controller.signal,
    });

    const rawText = await response.text();
    const data = parseJsonSafely(rawText) || {};

    if (!response.ok) {
      const errorMessage = data?.message || rawText || "Unexpected UddoktaPay response";
      throw new Error(`UddoktaPay request failed: ${errorMessage}`);
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("UddoktaPay request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const normalizePaymentStatus = (value) => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!normalized && value === true) return "completed";
  if (!normalized && value === false) return "failed";

  if (["completed", "paid", "success", "succeeded"].includes(normalized)) {
    return "completed";
  }
  if (["pending", "processing"].includes(normalized)) {
    return "pending";
  }
  if (["failed", "error", "declined"].includes(normalized)) {
    return "failed";
  }
  if (["cancelled", "canceled"].includes(normalized)) {
    return "cancelled";
  }
  if (["refunded"].includes(normalized)) {
    return "refunded";
  }

  return normalized || "unknown";
};

export const isSuccessfulCheckoutResponse = (response) => {
  const status = response?.status;
  if (typeof status === "boolean") return status;
  if (typeof status === "string") {
    return ["success", "true", "1"].includes(status.trim().toLowerCase());
  }
  return false;
};

export const extractInvoiceIdFromValue = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    try {
      const url = new URL(trimmed);
      return (
        url.searchParams.get("invoice_id") ||
        url.searchParams.get("invoiceId") ||
        ""
      ).trim();
    } catch {
      return trimmed;
    }
  }

  if (value && typeof value === "object") {
    return (
      extractInvoiceIdFromValue(value.invoice_id) ||
      extractInvoiceIdFromValue(value.invoiceId) ||
      extractInvoiceIdFromValue(value.payment_url) ||
      extractInvoiceIdFromValue(value.data) ||
      ""
    );
  }

  return "";
};

export const createUddoktaCheckout = async (payload) => {
  return requestUddokta("/api/checkout-v2", payload);
};

export const verifyUddoktaPayment = async (invoiceId) => {
  if (!invoiceId) {
    throw new Error("Invoice ID is required for payment verification");
  }
  return requestUddokta("/api/verify-payment", { invoice_id: invoiceId });
};

export const refundUddoktaPayment = async (payload) => {
  return requestUddokta("/api/refund-payment", payload);
};

const getHeaderValue = (req, key) => {
  if (!req?.headers) return "";
  const normalizedKey = key.toLowerCase();
  const value = req.headers[normalizedKey] ?? req.headers[key];
  return typeof value === "string" ? value.trim() : "";
};

export const isValidUddoktaWebhookRequest = (req) => {
  const { webhookApiKey } = getUddoktaConfig();
  if (!webhookApiKey) return false;
  const receivedKey = getHeaderValue(req, API_KEY_HEADER);
  return Boolean(receivedKey && receivedKey === webhookApiKey);
};

export const UDDOKTAPAY_HEADER = API_KEY_HEADER;
