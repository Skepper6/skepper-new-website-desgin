import type { Metadata } from "next";
import { AboutPage } from "@/components/dial/Pages";

export const metadata: Metadata = { title: "Why I built Skepper", description: "Skepper is a boutique, founder-led branding and creative studio in Bengaluru, founded in 2013 by Binoy Sundhar Parakat." };

export default function Page() {
  return <AboutPage />;
}
