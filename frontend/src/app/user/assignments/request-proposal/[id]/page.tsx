import React, { Suspense } from "react";
import { RequestProposalClient } from "./RequestProposalClient";

export const metadata = {
  title: "Request Proposal | Aski",
  description: "Request a proposal from a tutor",
};

export default function RequestProposalPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-10" />}>
      <RequestProposalClient />
    </Suspense>
  );
}
