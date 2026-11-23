"use client";
import { priceText, SPECIALS, svc } from "@/lib/catalogue";
import { SLink } from "@/lib/site";
import { actions } from "@/lib/store";
import { Order } from "../flow/Bits";
import { Closer } from "../show/Closer";
import { Faq } from "../show/Faq";
import { Float } from "../show/Float";
import { Knob } from "../show/Knob";
import { Pods } from "../show/Pods";
import { Steps } from "../show/Steps";
import { Studio } from "../show/Studio";
import { Voices } from "../show/Voices";
import { Wheel } from "../show/Wheel";
import { DeptDial } from "./Dials";
import { FilmWords } from "./FilmWords";

const PIC: Record<string, string> = { logo: "land-optimizer", v30: "hiv-self-test", social20: "fischer-social", site: "reparil" };

export function DialHome() {
  return (
    <>
      <FilmWords words="BREW YOUR BRAND">
        <p className="t-lead">Strategy, identity, film, web and campaigns, from a founder-led studio in Bengaluru. Order online at a clear price and follow every stage.</p>
        <div className="talk-go">
          <SLink className="cta" href="/services/">Explore services</SLink>
          <button type="button" className="link" onClick={() => actions.configure("bqa")}>Free brand assessment</button>
        </div>
      </FilmWords>
      <DeptDial />
      <Float />
      <section className="orbits" aria-labelledby="orb-h">
        <h2 id="orb-h">Popular right now</h2>
        {SPECIALS.map((id, i) => {
          const s = svc(id)!;
          return (
            <Order key={id} sid={id} className={"orbit orbit-" + i} label={`Order ${s.name}`}>
              <img src={`/work/${PIC[id]}.webp`} alt="" width={820} height={840} loading="lazy" data-iris />
              <span><b>{s.name}</b>{priceText(s)}</span>
            </Order>
          );
        })}
        <p>Every project includes up to 4 correction rounds. Start with a 50% advance. GST invoice issued.</p>
      </section>
      <Steps />
      <Wheel limit={10} title="Fewer clients, deeper impact" />
      <Knob />
      <Pods />
      <Studio />
      <Voices />
      <Faq />
      <Closer />
    </>
  );
}
