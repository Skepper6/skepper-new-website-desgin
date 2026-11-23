import type { Metadata } from "next";
import { Legal, TERMS } from "@/components/flow/Legal";

export const metadata: Metadata = { title: "Order terms", description: "How payment, corrections, delivery and cancellation work when you order from Skepper." };

export default function Page() {
  return <Legal title="Order terms" items={TERMS} />;
}
