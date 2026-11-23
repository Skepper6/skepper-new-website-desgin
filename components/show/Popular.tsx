"use client";
import { useState } from "react";
import { priceText, SPECIALS, svc, timeText } from "@/lib/catalogue";
import { svcPic } from "@/lib/pics";
import { actions } from "@/lib/store";
import { Icon } from "../Icon";

/** Four doors. The one you reach for opens wide. */
export function Popular() {
  const [on, setOn] = useState(0);
  return (
    <section className="pop" aria-labelledby="pop-h">
      <div className="split-head">
        <h2 id="pop-h">Popular <b>right now</b></h2>
        <p>Every project includes up to 4 correction rounds. Start with a 50% advance. GST invoice issued.</p>
      </div>
      <ul className="pop-row">
        {SPECIALS.map((id, i) => {
          const s = svc(id)!;
          return (
            <li key={id} data-on={i === on} onPointerEnter={(e) => e.pointerType === "mouse" && setOn(i)}>
              <button type="button" onFocus={() => setOn(i)} onClick={() => actions.configure(id)} aria-label={`Order ${s.name}, ${priceText(s)}`}>
                <img src={svcPic(id)} alt="" width={820} height={840} loading="lazy" />
                <span className="pop-price num">{priceText(s)}</span>
                <span className="pop-cap">
                  <b>{s.name}</b>
                  <span className="pop-more"><span>{s.desc}</span><span className="pop-go">{timeText(s)} <i><Icon name="arrow" /></i></span></span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
