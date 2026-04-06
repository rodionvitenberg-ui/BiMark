"use client";

import { LandingHero } from "@/components/landing/LandingHero";
import { LandingShift } from "@/components/landing/LandingShift";
import { LandingBenefits } from "@/components/landing/LandingBenefits";
import { LandingSecurity } from "@/components/landing/LandingSecurity";
import { LandingSteps } from "@/components/landing/LandingSteps";
import { LandingFinalCta } from "@/components/landing/LandingFinalCta"; // <-- Импорт

export default function VisionPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#0a0f1c]">
      <LandingHero />
      <LandingShift />
      <LandingBenefits />
      <LandingSecurity />
      <LandingSteps />
      <LandingFinalCta /> {/* Финальный мощный аккорд */}
    </main>
  );
}