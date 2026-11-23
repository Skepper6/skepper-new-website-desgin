import { Poppins } from "next/font/google";
import { Overlay } from "@/components/flow/Chrome";
import { End } from "@/components/show/Footer";
import { Top } from "@/components/show/Header";
import { SiteProvider } from "@/lib/site";
import "../styles/rooms.css";

const text = Poppins({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500", "600", "700"], variable: "--text", display: "swap" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site rooms ${text.variable}`}>
      <SiteProvider name="rooms">
        <a className="skip" href="#main">Skip to content</a>
        <Top />
        <main id="main">{children}</main>
        <End />
        <Overlay />
      </SiteProvider>
    </div>
  );
}
