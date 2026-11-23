import type { Metadata } from "next";
import { Wheel } from "@/components/show/Wheel";
import { Closer } from "@/components/show/Closer";
import { Voices } from "@/components/show/Voices";
import { Wall } from "@/components/show/Wall";

export const metadata: Metadata = { title: "Work", description: "Identity, campaigns, websites, films, print and social work by Skepper for pharma, healthcare and growth-stage brands." };

export default function Page() {
  return (
    <>
      <Wheel title="Fewer clients, deeper impact" filter level={1} />
      <Wall />
      <Voices />
      <Closer title={<>What could <b>your story</b> look like?</>} />
    </>
  );
}
