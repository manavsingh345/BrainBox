"use client";

import { Suspense } from "react";
import Pricing from "@mysecondbrain/ui/pages/Pricing";

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Pricing />
    </Suspense>
  );
}
