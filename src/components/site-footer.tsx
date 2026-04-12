import Link from "next/link";

const footerLinks = [
  { label: "개인정보처리방침", href: "/privacy-policy" },
  { label: "이용약관", href: "/terms" },
  { label: "회사 소개", href: "/company" },
  { label: "상담 문의", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-3 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 text-sm">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-600 hover:text-gray-900">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
}
