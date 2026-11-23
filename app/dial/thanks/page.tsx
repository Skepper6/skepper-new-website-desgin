import type { Metadata } from "next";
import { Thanks } from "@/components/flow/Thanks";

export const metadata: Metadata = { title: "Order placed", description: "Your order is brewing.", robots: { index: false } };

export default function Page() {
  return <Thanks />;
}
