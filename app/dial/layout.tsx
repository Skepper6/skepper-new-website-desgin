import { Unbounded, Poppins } from "next/font/google";
import { Overlay } from "@/components/flow/Chrome";
import { End } from "@/components/show/Footer";
import { Top } from "@/components/show/Header";
import { SiteProvider } from "@/lib/site";
import "../styles/dial.css";

const display = Unbounded({ subsets: ["latin", "latin-ext"], variable: "--display", display: "block" });
const text = Poppins({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500", "700"], variable: "--text", display: "swap" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site dial ${display.variable} ${text.variable}`}>
      <SiteProvider name="dial">
        <a className="skip" href="#main">Skip to content</a>
        <Top />
        <main id="main">{children}</main>
        <End />
        <Overlay />
      </SiteProvider>
    </div>
  );
}
