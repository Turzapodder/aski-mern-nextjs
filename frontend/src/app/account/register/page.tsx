import React, { Suspense } from "react";
import { RegisterClient } from "./RegisterClient";

export const metadata = {
  title: "Register | Aski",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterClient />
    </Suspense>
  );
}
