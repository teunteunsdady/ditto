import { CompanyScrollSections } from "@/components/company-scroll-sections";
import { HomeScrollSections } from "@/components/home-scroll-sections";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export default function CompanyPage() {
  return (
    <main className="bg-[#f4f6fa] text-[#191f28]">
      <RevealOnScroll />
      <CompanyScrollSections
        includeMiddleSections={false}
        includeContactSection={false}
        introSectionId="company-intro"
      />
      <HomeScrollSections />
      <CompanyScrollSections
        includeIntroSection={false}
        includeMiddleSections={false}
        contactSectionId="company-contact"
      />
    </main>
  );
}
