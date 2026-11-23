import type { Metadata } from "next";
import { Checkout } from "@/components/flow/Checkout";

export const metadata: Metadata = { title: "Checkout", description: "Review your order and pay.", robots: { index: false } };

export default function Page() {
  return <Checkout />;
}
