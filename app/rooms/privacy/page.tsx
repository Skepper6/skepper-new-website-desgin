import type { Metadata } from "next";
import { Legal, PRIVACY } from "@/components/flow/Legal";

export const metadata: Metadata = { title: "Privacy", description: "What this prototype store keeps, and where." };

export default function Page() {
  return <Legal title="Privacy" items={PRIVACY} />;
}
