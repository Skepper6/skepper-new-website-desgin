"use client";
import { useRef, useState } from "react";
import { CATS } from "@/lib/catalogue";
import { COMPANY } from "@/lib/content";

/** A letter with blanks. There is no form server yet, so it opens ready-written in the visitor’s mail app. */
export function Contact() {
  const [v, setV] = useState({ name: "", website: "", topic: CATS[0].name, message: "" });
  const [err, setErr] = useState<{ name?: string; message?: string }>({});
  const [sent, setSent] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });
  return (
    <div className="letter-page">
      <div className="letter-main">
      <h1>Let’s <b>talk</b></h1>
      <form
        ref={form}
        className="letter"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const bad: typeof err = {};
          if (!v.name.trim()) bad.name = "Add your name.";
          if (!v.message.trim()) bad.message = "Tell us what you are building.";
          setErr(bad);
          const k = Object.keys(bad)[0];
          if (k) {
            form.current?.querySelector<HTMLElement>(`[name=${k}]`)?.focus();
            return;
          }
          const body = [v.message.trim(), "", `Name: ${v.name.trim()}`, v.website.trim() ? `Website: ${v.website.trim()}` : null, `About: ${v.topic}`].filter((x) => x !== null).join("\n");
          setSent(true);
          location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(`${v.topic}: enquiry from ${v.name.trim()}`)}&body=${encodeURIComponent(body)}`;
        }}
      >
        <p className="find-say">
          <span>My name is </span>
          <label><span className="sr">Your name</span><input name="name" autoComplete="name" placeholder="your name" value={v.name} onChange={set("name")} aria-invalid={!!err.name} aria-describedby={err.name ? "k-n" : undefined} /></label>
          <span> and I need help with </span>
          <label><span className="sr">Topic</span><select value={v.topic} onChange={set("topic")}>{CATS.map((c) => <option key={c.id}>{c.name}</option>)}<option>Something else</option></select></label>
          <span> for </span>
          <label><span className="sr">Website, optional</span><input name="website" autoComplete="url" placeholder="your website" value={v.website} onChange={set("website")} /></label>
        </p>
        {err.name ? <p className="err" id="k-n">{err.name}</p> : null}
        <div className="ask-field wide">
          <label htmlFor="k-m">What are you building, and why does it matter?</label>
          <textarea id="k-m" name="message" rows={4} value={v.message} onChange={set("message")} aria-invalid={!!err.message} aria-describedby={err.message ? "k-e" : undefined} />
          {err.message ? <p className="err" id="k-e">{err.message}</p> : null}
        </div>
        <button className="cta" type="submit">Write the email</button>
        <p role="status">{sent ? `Your mail app should be open with the message ready. If it is not, write to ${COMPANY.email}.` : "Opens your mail app with everything filled in."}</p>
      </form>
      </div>
      <div className="letter-side">
        <img src="/film/crew-3.webp" alt="Skepper crew filming on a factory floor" width={1280} height={720} />
        <a href={`tel:${COMPANY.tel}`}><b>{COMPANY.phone}</b>{COMPANY.hours}</a>
        <a href={`mailto:${COMPANY.email}`}><b>{COMPANY.email}</b>Write to us</a>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address)}`} rel="noopener" target="_blank"><b>Visit the studio</b>{COMPANY.address}</a>
      </div>
    </div>
  );
}
