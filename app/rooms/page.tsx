import type { Metadata } from "next";
import { RoomsHome } from "@/components/rooms/Home";

export const metadata: Metadata = { alternates: { canonical: "/rooms/" } };

export default function Page() {
  return <RoomsHome />;
}
