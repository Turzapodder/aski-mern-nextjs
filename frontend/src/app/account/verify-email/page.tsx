import React, { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";

export const metadata = {
  title: "Verify Email | Aski",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
