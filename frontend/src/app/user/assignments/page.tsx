import React, { Suspense } from "react";
import { AssignmentsClient } from "./AssignmentsClient";

export const metadata = {
  title: "Assignments | Aski",
  description: "Manage and view all assignment requests",
};

export default function AllAssignmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <AssignmentsClient />
    </Suspense>
  );
}
