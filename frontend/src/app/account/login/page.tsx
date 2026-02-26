import React, { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export const metadata = {
  title: "Login | Aski",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginClient />
    </Suspense>
  );
}
