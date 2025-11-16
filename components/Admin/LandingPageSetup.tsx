"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import IntroSection from "./landing-page/IntroSection";
import OurSolutions from "./landing-page/OurSolutions";
import BusinessStatistics from "./landing-page/BusinessStatistics";
import EarnMoney from "./landing-page/EarnMoney";
import Testimonial from "./landing-page/Testimonial";
import CTA from "./landing-page/CTA";

const sections = [
  { id: "intro-section", label: "Intro Section", component: IntroSection },
  { id: "our-solutions", label: "Our Solutions", component: OurSolutions },
  { id: "business-statistics", label: "Business Statistics", component: BusinessStatistics },
  { id: "earn-money", label: "Earn Money", component: EarnMoney },
  { id: "testimonial", label: "Testimonial", component: Testimonial },
  { id: "cta", label: "CTA", component: CTA },
];

export default function LandingPageSetup() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>("intro-section");

  useEffect(() => {
    // Get section from URL path
    const pathSegments = pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];
    const sectionFromUrl = sections.find((s) => s.id === lastSegment);
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl.id);
    } else {
      setActiveSection("intro-section");
      router.push("/admin/business/pages-media/landing-page/intro-section");
    }
  }, [pathname, router]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    router.push(`/admin/business/pages-media/landing-page/${sectionId}`);
  };

  const ActiveComponent = sections.find((s) => s.id === activeSection)?.component || IntroSection;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">Landing Page Setup</h2>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex items-center space-x-1 p-2 overflow-x-auto">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Content */}
      <ActiveComponent />
    </div>
  );
}
