"use client";
import { useState } from "react";
import { COMPANY, FAQ } from "@/lib/content";
import { Icon } from "../Icon";

export function Faq() {
  const [on, setOn] = useState(0);
  return (
    <section className="faq" aria-labelledby="faq-h">
      <div className="faq-side">
        <div className="faq-card">
          <img src="/glass/mark.webp" alt="" width={949} height={1100} loading="lazy" />
          <div>
            <p>Rather ask a person?</p>
            <a href={`tel:${COMPANY.tel}`}>{COMPANY.phone}</a>
            <small>{COMPANY.hours}</small>
          </div>
        </div>
      </div>
      <div className="faq-main">
        <h2 id="faq-h">Ask before <b>you order</b></h2>
        <ul>
          {FAQ.map(([q, a], i) => (
            <li key={q} data-on={on === i}>
              <h3><button type="button" aria-expanded={on === i} aria-controls={`faq-${i}`} onClick={() => setOn(on === i ? -1 : i)}><span>{q}</span><i><Icon name="plus" /></i></button></h3>
              <div id={`faq-${i}`} className="faq-a" inert={on !== i}><p>{a}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
