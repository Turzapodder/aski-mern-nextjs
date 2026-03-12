export const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or hate speech',
  'Inappropriate content',
  'Fraud or scam',
  'Low quality or irrelevant',
  'Other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];
