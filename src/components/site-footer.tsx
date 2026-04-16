import Link from "next/link";

const footerLinks = [
  { label: "개인정보처리방침", href: "/privacy-policy" },
  { label: "이용약관", href: "/terms" },
  { label: "회사 소개", href: "/company" },
  { label: "상담 문의", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--core-base-border)] bg-[var(--core-base-bg)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap gap-3 text-sm">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[#4e5d57] hover:text-[#1f3a33]">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-[#64726d]">
          © {new Date().getFullYear()} 코어그라운드(CoreGround). All rights reserved.
        </p>
      </div>
    </footer>
  );
}
