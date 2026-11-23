import type { Metadata, Viewport } from "next";
import { COMPANY, SITE_URL } from "@/lib/content";
import "./styles/base.css";
import "./styles/flow.css";
import "./styles/show.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Skepper: branding, design, film and web, ordered online", template: "%s | Skepper" },
  description: "Order logos, films, posts, websites and full brand systems online at a clear price. 59 services with prices from Skepper Creative Agency, Bengaluru.",
  openGraph: { type: "website", siteName: "Skepper", locale: "en_IN", images: [{ url: "/brand/og.png", width: 1200, height: 630 }] },
  icons: { icon: "/brand/icon.svg", apple: "/brand/apple.png" },
};
export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

const org = {
  "@context": "https://schema.org", "@type": "ProfessionalService", name: COMPANY.name, url: SITE_URL, email: COMPANY.email, telephone: COMPANY.tel,
  foundingDate: "2013", vatID: COMPANY.gstin, openingHours: "Mo-Sa 10:00-19:00",
  address: { "@type": "PostalAddress", streetAddress: "S003, Devin Indira Paradise, Chokkanahalli", addressLocality: "Bengaluru", postalCode: "560063", addressCountry: "IN" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Runs before the first paint, so pages never start in one layout and switch to another. */}
        <script dangerouslySetInnerHTML={{ __html: `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("fx")` }} />
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </body>
    </html>
  );
}
