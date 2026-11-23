import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/rooms/Pages";
import { cat, SERVICES, svc } from "@/lib/catalogue";
import { SITE_URL } from "@/lib/content";

type Params = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => SERVICES.map((s) => ({ id: s.id }));
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = svc((await params).id);
  if (!s) return {};
  const price = s.unit === "free" ? "Free" : s.unit === "quote" ? "On quote" : `From ₹${s.price.toLocaleString("en-IN")}`;
  return { title: s.name, description: `${s.desc} ${price}. Order online from Skepper, Bengaluru.` };
}

export default async function Page({ params }: Params) {
  const s = svc((await params).id);
  if (!s) notFound();
  const ld = {
    "@context": "https://schema.org", "@type": "Service", name: s.name, description: s.desc, serviceType: cat(s.cat).name, url: `${SITE_URL}/rooms/service/${s.id}/`,
    provider: { "@type": "Organization", name: "Skepper Creative Agency Pvt Ltd" },
    ...(s.unit === "quote" ? {} : { offers: { "@type": "Offer", price: s.price, priceCurrency: "INR" } }),
  };
  return (
    <>
      <ServicePage sid={s.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
