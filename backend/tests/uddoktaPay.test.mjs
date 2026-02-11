import test from "node:test";
import assert from "node:assert/strict";

import {
  extractInvoiceIdFromValue,
  getUddoktaConfig,
  isSuccessfulCheckoutResponse,
  isUddoktaConfigured,
  normalizePaymentStatus,
  normalizeUddoktaBaseUrl,
} from "../utils/uddoktaPay.js";

test("normalizeUddoktaBaseUrl normalizes protocol and trailing slash", () => {
  assert.equal(normalizeUddoktaBaseUrl("aski.paymently.io/"), "https://aski.paymently.io");
  assert.equal(
    normalizeUddoktaBaseUrl("https://aski.paymently.io///"),
    "https://aski.paymently.io"
  );
  assert.equal(normalizeUddoktaBaseUrl(""), "");
});

test("extractInvoiceIdFromValue handles url, object, and raw id", () => {
  assert.equal(
    extractInvoiceIdFromValue("https://pay.example.com/checkout?invoice_id=INV-100"),
    "INV-100"
  );
  assert.equal(extractInvoiceIdFromValue({ invoice_id: "INV-200" }), "INV-200");
  assert.equal(extractInvoiceIdFromValue("INV-300"), "INV-300");
  assert.equal(extractInvoiceIdFromValue(null), "");
});

test("normalizePaymentStatus maps known statuses", () => {
  assert.equal(normalizePaymentStatus("COMPLETED"), "completed");
  assert.equal(normalizePaymentStatus("pending"), "pending");
  assert.equal(normalizePaymentStatus("ERROR"), "failed");
  assert.equal(normalizePaymentStatus("cancelled"), "cancelled");
  assert.equal(normalizePaymentStatus(true), "completed");
  assert.equal(normalizePaymentStatus(false), "failed");
});

test("isSuccessfulCheckoutResponse supports boolean and string status", () => {
  assert.equal(isSuccessfulCheckoutResponse({ status: true }), true);
  assert.equal(isSuccessfulCheckoutResponse({ status: "true" }), true);
  assert.equal(isSuccessfulCheckoutResponse({ status: "success" }), true);
  assert.equal(isSuccessfulCheckoutResponse({ status: false }), false);
});

test("isUddoktaConfigured reads env safely", () => {
  const previousBase = process.env.UDDOKTAPAY_BASE_URL;
  const previousKey = process.env.UDDOKTAPAY_API_KEY;

  process.env.UDDOKTAPAY_BASE_URL = "aski.paymently.io";
  process.env.UDDOKTAPAY_API_KEY = "demo-key";

  const config = getUddoktaConfig();
  assert.equal(config.baseUrl, "https://aski.paymently.io");
  assert.equal(config.apiKey, "demo-key");
  assert.equal(isUddoktaConfigured(), true);

  process.env.UDDOKTAPAY_BASE_URL = "";
  process.env.UDDOKTAPAY_API_KEY = "";
  assert.equal(isUddoktaConfigured(), false);

  process.env.UDDOKTAPAY_BASE_URL = previousBase;
  process.env.UDDOKTAPAY_API_KEY = previousKey;
});
