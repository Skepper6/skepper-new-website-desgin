import type { Metadata } from "next";
import { Contact } from "@/components/flow/Contact";

export const metadata: Metadata = { title: "Contact", description: "Write, call or visit Skepper Creative Agency in Chokkanahalli, Bengaluru. Mon to Sat, 10 am to 7 pm." };

export default function Page() {
  return <Contact />;
}
