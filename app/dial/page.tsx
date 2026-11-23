import type { Metadata } from "next";
import { DialHome } from "@/components/dial/Home";

export const metadata: Metadata = { alternates: { canonical: "/dial/" } };

export default function Page() {
  return <DialHome />;
}
