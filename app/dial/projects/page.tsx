import type { Metadata } from "next";
import { Suspense } from "react";
import { Projects } from "@/components/flow/Projects";

export const metadata: Metadata = { title: "My Projects", description: "Share briefs, review drafts, request corrections and download final files.", robots: { index: false } };

export default function Page() {
  return <Suspense><Projects /></Suspense>;
}
