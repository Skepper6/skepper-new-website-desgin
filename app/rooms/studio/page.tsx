import type { Metadata } from "next";
import { StudioBoard } from "@/components/flow/Projects";

export const metadata: Metadata = { title: "Studio Board", description: "Internal board for the Skepper team.", robots: { index: false } };

export default function Page() {
  return <StudioBoard />;
}
