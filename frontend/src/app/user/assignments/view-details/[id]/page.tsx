import React, { Suspense } from "react";
import { ViewDetailsClient } from "./ViewDetailsClient";

export const metadata = {
  title: "Assignment Details | Aski",
  description: "View assignment details",
};

export default function AssignmentDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-6" />}>
      <ViewDetailsClient />
    </Suspense>
  );
}
