import type { Metadata } from "next";
import { Find } from "@/components/flow/Find";
import { Closer } from "@/components/show/Closer";
import { Knob } from "@/components/show/Knob";
import { Pods } from "@/components/show/Pods";

export const metadata: Metadata = { title: "Services: 59 creative services with prices", description: "Brand strategy, logos, social posts, films, print, websites, SEO, pharma creative, subscription pods and events. Set the options and see the price instantly." };

export default function Page() {
  return (
    <>
      <header className="lead-in"><h1>Pick, price, <b>order</b></h1></header>
      <Find />
      <Knob />
      <Pods />
      <Closer />
    </>
  );
}
