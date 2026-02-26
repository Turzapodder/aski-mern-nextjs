import React, { Suspense } from "react";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Settings | Aski",
  description: "Manage your account preferences and settings",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <SettingsClient />
    </Suspense>
  );
}
