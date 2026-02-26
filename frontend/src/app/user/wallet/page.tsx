import React, { Suspense } from "react";
import { WalletClient } from "./WalletClient";

export const metadata = {
  title: "Wallet | Aski",
  description: "Your earnings dashboard and wallet",
};

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f5fb]" />}>
      <WalletClient />
    </Suspense>
  );
}
