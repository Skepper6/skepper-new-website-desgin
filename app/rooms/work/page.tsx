import type { Metadata } from "next";
import { Closer } from "@/components/show/Closer";
import { Voices } from "@/components/show/Voices";
import { Wall } from "@/components/show/Wall";
import { Wheel } from "@/components/show/Wheel";

export const metadata: Metadata = { title: "Work", description: "Identity, campaigns, websites, films, print and social work by Skepper for pharma, healthcare and growth-stage brands." };

export default function Page() {
  return (
    <>
      <Wheel limit={12} level={1} title={<>Fewer clients, <b>deeper impact</b></>} />
      <Wall />
      <Voices />
      <Closer title={<>What could <b>your story</b> look like?</>} />
    </>
  );
}
