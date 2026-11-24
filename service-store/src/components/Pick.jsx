import { useEffect, useRef, useState } from "react";
import { two } from "../lib/pricing";

/** One choice from a list, in a panel that opens under its button. Works with mouse, touch and arrow keys. */
export default function Pick({ label, value, options, onPick }) {
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const box = useRef(null);
  const list = useRef(null);
  const typed = useRef({ text: "", time: 0 });
  const now = Math.max(0, options.findIndex((o) => o.id === value));

  useEffect(() => {
    if (!open) return undefined;
    const out = (e) => { if (!e.composedPath().includes(box.current)) setOpen(false); };
    document.addEventListener("pointerdown", out);
    return () => document.removeEventListener("pointerdown", out);
  }, [open]);

  // Keep the marked line in view inside the panel, once the panel has finished opening.
  useEffect(() => {
    const ul = list.current;
    const li = open && ul.children[at];
    if (!li) return undefined;
    const t = setTimeout(() => {
      if (li.offsetTop - 10 < ul.scrollTop) ul.scrollTop = li.offsetTop - 10;
      else if (li.offsetTop + li.offsetHeight + 10 > ul.scrollTop + ul.clientHeight) ul.scrollTop = li.offsetTop + li.offsetHeight + 10 - ul.clientHeight;
    }, ul.clientHeight < 200 ? 600 : 0);
    return () => clearTimeout(t);
  }, [open, at]);

  // Low on the screen there is no room for the list, so the page glides up until the bar meets the header.
  const show = () => {
    setAt(now);
    setOpen(true);
    const b = box.current.getBoundingClientRect();
    const head = parseFloat(getComputedStyle(box.current.closest(".filters")).top) || 0;
    const need = b.bottom + 24 + Math.min(list.current.scrollHeight + 20, 540) - innerHeight;
    const move = Math.min(need, b.top - head - 18);
    if (move > 1) scrollBy({ top: move, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const choose = (i) => { setOpen(false); onPick(options[i].id); };
  const keys = (e) => {
    const { key } = e;
    if (key === "Tab") { setOpen(false); return; }
    if (key === "Escape") { if (open) { e.preventDefault(); setOpen(false); } return; }
    if (key === "Enter" || key === " ") { e.preventDefault(); if (open) choose(at); else show(); return; }
    const last = options.length - 1;
    const to = { ArrowDown: Math.min(last, at + 1), ArrowUp: Math.max(0, at - 1), Home: 0, End: last }[key];
    if (to !== undefined) { e.preventDefault(); if (open) setAt(to); else show(); return; }
    if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typed.current;
      t.text = (e.timeStamp - t.time < 700 ? t.text : "") + key.toLowerCase();
      t.time = e.timeStamp;
      const i = options.findIndex((o) => o.name.toLowerCase().startsWith(t.text));
      if (i >= 0) { setOpen(true); setAt(i); }
    }
  };

  return (
    <div className="pick" ref={box} data-open={open} onBlur={(e) => { if (!box.current.contains(e.relatedTarget)) setOpen(false); }}>
      <button
        type="button" className="pick-btn" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls="pick-list"
        aria-label={`${label}: ${options[now].name}`} aria-activedescendant={open ? "pick-" + options[at].id : undefined}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={keys}
      >
        <span className="pick-name">{options[now].name}</span>
        <span className="pick-n num">{options[now].n}</span>
        <i aria-hidden="true"><svg width="14" height="9" viewBox="0 0 14 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m1.5 1.5 5.5 5.5 5.5-5.5" /></svg></i>
      </button>
      <div className="pick-panel">
        <ul id="pick-list" role="listbox" aria-label={label} ref={list}>
          {options.map((o, i) => (
            <li
              key={o.id} id={"pick-" + o.id} role="option" aria-selected={o.id === value} className={i === at ? "at" : ""}
              onPointerMove={() => setAt(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)}
            >
              <span className="pick-no num" aria-hidden="true">{i ? two(i) : "✻"}</span>
              <span className="pick-name">{o.name}</span>
              <span className="pick-n num">{o.n}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
