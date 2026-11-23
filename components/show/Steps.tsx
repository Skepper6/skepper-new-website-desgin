"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GST, svc } from "@/lib/catalogue";
import { fmt } from "@/lib/format";
import { newItem, priceOf } from "@/lib/pricing";
import { actions } from "@/lib/store";
import { Icon } from "../Icon";
import { Mark } from "../Mark";

gsap.registerPlugin(ScrollTrigger);
const LOGO = svc("logo")!;

/** Ordering, as four sheets that slide over each other. The price you build on the first is carried to the second. */
export function Steps() {
  const root = useRef<HTMLElement>(null);
  const [pack, setPack] = useState(0);
  const [fast, setFast] = useState(false);
  const total = priceOf({ ...newItem("logo"), opts: [pack], addons: fast ? ["express"] : [] }).total;
  const grand = total * (1 + GST);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".step", root.current!);
      cards.slice(0, -1).forEach((c, i) => {
        gsap.to(c.firstElementChild, { scale: 0.93 + i * 0.012, ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 12%", scrub: true } });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="steps" aria-labelledby="steps-h">
      <div className="split-head">
        <h2 id="steps-h">How an <b>order works</b></h2>
        <p>Try it here. This is a logo order, with the real prices.</p>
      </div>
      <ol>
        <li className="step" style={{ ["--bg" as string]: "#e6dcf6" }}>
          <div className="step-in">
            <div className="step-say"><h3>You <b>choose</b></h3><p>Pick a service, set the options, see the price instantly.</p></div>
            <div className="step-ui">
              <div className="ui-card ui-pick">
                <img src="/work/argitektur.webp" alt="" width={820} height={840} loading="lazy" />
                <div>
                  <p className="ui-h">{LOGO.name}</p>
                  {LOGO.opts![0].choices.map(([l, p], i) => (
                    <button key={l} type="button" aria-pressed={pack === i} onClick={() => setPack(i)}><span>{l}</span><span className="num">{p ? "+" + fmt(p) : "Included"}</span></button>
                  ))}
                  <button type="button" aria-pressed={fast} onClick={() => setFast(!fast)}><span>Express delivery, about 3 working days</span><span className="num">{fast ? "Added" : "Add"}</span></button>
                  <p className="ui-total"><span>Your price</span><b className="num" key={total}>{fmt(total)}</b></p>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li className="step" style={{ ["--bg" as string]: "#d3e9fb" }}>
          <div className="step-in">
            <div className="step-say"><h3>You <b>pay half</b></h3><p>50% advance for projects. Monthly plans are paid in advance.</p></div>
            <div className="step-ui">
              <div className="ui-card ui-bill">
                <p><span>{LOGO.name}</span><span className="num">{fmt(total)}</span></p>
                <p><span>GST 18%</span><span className="num">{fmt(total * GST)}</span></p>
                <p className="ui-sum"><span>Total</span><b className="num">{fmt(grand)}</b></p>
                <div className="ui-halves"><span><small>Now</small><b className="num">{fmt(grand / 2)}</b></span><span><small>When finals are ready</small><b className="num">{fmt(grand / 2)}</b></span></div>
              </div>
            </div>
          </div>
        </li>
        <li className="step" style={{ ["--bg" as string]: "#fbe7b4" }}>
          <div className="step-in">
            <div className="step-say"><h3>You <b>brief us</b></h3><p>Share your goals, references and files in your portal.</p></div>
            <div className="step-ui" aria-hidden="true">
              <div className="ui-card ui-brief">
                <p className="ui-h">Your brief</p>
                <p className="ui-line"><small>Goal</small>A mark that reads at 16 pixels and on a building.</p>
                <p className="ui-line"><small>References</small></p>
                <div className="ui-files">{["land-optimizer", "balefio", "healthium"].map((id) => <img key={id} src={`/work/${id}.webp`} alt="" width={820} height={840} loading="lazy" />)}<i><Icon name="plus" size={26} /></i></div>
              </div>
            </div>
          </div>
        </li>
        <li className="step" style={{ ["--bg" as string]: "#fcd9d2" }}>
          <div className="step-in">
            <div className="step-say"><h3>You <b>approve</b></h3><p>Review drafts, request up to 4 rounds, download finals.</p><button type="button" className="cta" onClick={() => actions.configure("logo")}>Order a logo</button></div>
            <div className="step-ui" aria-hidden="true">
              <div className="ui-card ui-draft">
                <div className="ui-pic"><img src="/work/land-optimizer.webp" alt="" width={820} height={840} loading="lazy" /><i className="pin pin-a" /><i className="pin pin-b" /><p className="ui-note">Love the depth. Warmer orange?</p></div>
                <div className="ui-rounds"><Mark /><span><b>Draft 2 of 4</b>Ready for your review</span><em><Icon name="check" /> Approve</em></div>
              </div>
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
}
