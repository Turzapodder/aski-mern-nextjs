import React, { Suspense } from "react";
import { ProjectsClient } from "./ProjectsClient";

export const metadata = {
  title: "Projects | Aski",
  description: "Your ongoing projects",
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ProjectsClient />
    </Suspense>
  );
}
