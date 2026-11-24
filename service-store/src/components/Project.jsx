import { useState } from "react";
import { fileUrl, post, razorpay } from "../lib/api";
import { dstr, fmt } from "../lib/pricing";
import { useStore } from "../lib/store";
import { Field } from "./Bits";

const STATUS = { pending: "Waiting for your review", changes: "Corrections requested", approved: "Approved" };

export function StateChip({ p }) {
  const { menu } = useStore();
  const [c, t] =
    p.stage === 0 ? ["st-wait", p.quote ? "Discovery call" : "Brief needed"]
    : p.stage === 6 ? ["st-done", "Completed"]
    : p.files.some((f) => f.status === "pending") ? ["st-review", "Awaiting your review"]
    : p.stage === 5 ? ["st-review", p.paid < p.total - 1 ? "Balance due" : "Ready"]
    : ["st-work", menu.stages[p.stage]];
  return <span className={"state " + c}>{t}</span>;
}
export function DueChip({ p }) {
  if (p.stage >= 6 || p.quote) return null;
  const days = Math.ceil((new Date(p.due) - new Date()) / 864e5);
  return <span className={"due " + (days < 0 ? "late" : days <= 2 ? "soon" : "fine")}>{days < 0 ? Math.abs(days) + " days late" : days === 0 ? "Due today" : "Due " + dstr(p.due)}</span>;
}

function Brief({ p, act, busy, err }) {
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const up = f.getAll("pick").filter((x) => x.size);
    f.delete("pick");
    up.forEach((x) => f.append("files[]", x));
    act("brief", f);
  };
  const today = new Date().toLocaleDateString("en-CA");
  return (
    <div className="box"><h3>{p.quote ? "Tell us about your event" : "Share your brief"}</h3>
      <form onSubmit={submit} noValidate>
        <Field id="goal" label={`What should this ${p.quote ? "event" : "work"} achieve?`}><textarea id="goal" name="goal" required placeholder="e.g. Launch our new range and get 200 enquiries in the first month" /></Field>
        <div className="cols2">
          <Field id="audience" label="Who is it for?" placeholder="Audience, age, city, role" />
          <Field id="date" label="Deadline you are working to" type="date" min={today} />
        </div>
        <Field id="content" label="Key message and content"><textarea id="content" name="content" placeholder="Copy, product details, offers. Content is supplied by you unless the service includes writing." /></Field>
        <Field id="refs" label="References you like" placeholder="Links, brands or Instagram handles" />
        <div className="cols2">
          <Field id="assets" label="Brand assets"><select id="assets" name="assets"><option>Have logo & guidelines</option><option>Have logo only</option><option>Starting fresh</option></select></Field>
          <Field id="pick" label="Attach files" type="file" multiple />
        </div>
        <div className="err" role="alert">{err}</div>
        <button className="btn" type="submit" disabled={busy}>{busy ? "Sending" : "Submit brief"}</button>
      </form>
    </div>
  );
}

function FileRow({ f, n, rounds }) {
  return (
    <div className="file">
      <div className="ic">{f.name.split(".").pop().toUpperCase()}</div>
      <div className="grow"><b>{f.name}</b><small>{f.final ? "Final delivery" : `Draft ${n} · round ${f.round} of ${rounds}`} · {STATUS[f.status] || "Delivered"}</small></div>
      {f.stored ? <a className="btn plain" href={fileUrl(f.id)} aria-label={"Download " + f.name}>Download</a> : null}
    </div>
  );
}

export default function Project({ p, role, onChange }) {
  const { menu } = useStore();
  const { rounds, stages } = menu;
  const studio = role === "studio";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [corr, setCorr] = useState("");
  const [msg, setMsg] = useState("");
  const bal = p.total - p.paid;
  const pending = p.files.find((f) => f.status === "pending");

  const act = async (what, body) => {
    if (busy) return null;
    setBusy(true);
    setErr("");
    try {
      let r = await post(`${studio ? "/studio" : ""}/projects/${p.id}/${what}`, body);
      if (r.status === "pay") {
        const paid = await razorpay(r.razorpay);
        if (!paid) return null;
        r = await post("/payments/verify", paid);
      }
      const next = r.project || r;
      onChange(next);
      return next;
    } catch (e) {
      setErr(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  };
  const send = async (e) => {
    e.preventDefault();
    if (msg.trim() && (await act("messages", { text: msg }))) setMsg("");
  };
  const finish = async () => {
    const next = await act("complete");
    const f = next?.files.findLast((x) => x.final && x.stored);
    if (f) location.href = fileUrl(f.id);
  };
  const withFile = (what) => (e) => {
    e.preventDefault();
    act(what, new FormData(e.currentTarget));
  };
  const next = { 1: "Start production", 2: "Share first cut", 4: "Share revised draft" }[p.stage];
  const canNext = next && !(p.stage === 4 && pending);

  return (
    <div className="pd">
      <div className="pd-head">
        <div><div className="meta"><span className="chip num">{p.id}</span><StateChip p={p} />{p.example ? <span className="chip ex">Example</span> : null}</div><h2>{p.name}</h2><p className="note">{p.detail || "Standard scope"}</p></div>
        <DueChip p={p} />
      </div>
      <div className="track" role="img" aria-label={`Stage ${p.stage + 1} of 7, ${stages[p.stage]}`}>{stages.map((s, i) => <div key={s} className={i < p.stage || p.stage === 6 ? "done" : i === p.stage ? "now" : ""} />)}</div>
      <div className="tracklbl" aria-hidden="true">{stages.map((s) => <span key={s}>{s}</span>)}</div>
      <div className="pdgrid">
        <div>
          {p.stage === 0 && !studio ? <Brief p={p} act={act} busy={busy} err={err} /> : (
            <>
              <div className="box"><h3>Drafts & deliveries</h3>
                {p.files.length ? p.files.map((f, i) => <FileRow key={f.id} f={f} n={i + 1} rounds={rounds} />) : <p className="note">{studio ? "No drafts shared yet." : "Drafts will appear here as soon as the studio shares the first cut."}</p>}
                {!studio && pending ? (
                  <>
                    <div className="callout">Draft ready for review. You have used {p.round} of {rounds} included correction rounds.</div>
                    <Field id="corr" label="Corrections (if any)"><textarea id="corr" value={corr} onChange={(e) => setCorr(e.target.value)} placeholder="List changes clearly, one per line" /></Field>
                    <div className="actions"><button type="button" className="btn" disabled={busy} onClick={() => act("approve")}>Approve draft</button><button type="button" className="btn ghost" disabled={busy} onClick={async () => (corr.trim() ? (await act("changes", { text: corr })) && setCorr("") : (setErr("Please list the corrections before sending"), document.getElementById("corr").focus()))}>Request corrections</button></div>
                    {p.round >= rounds ? <p className="note">All {rounds} included rounds are used. Further corrections will be costed by our accounts team before work continues.</p> : null}
                  </>
                ) : null}
                {!studio && p.stage === 5 ? (bal > 1 ? <><div className="callout">Your work is approved. Pay the balance of <b className="num">{fmt(bal)}</b> to release the final files.</div><button type="button" className="btn" disabled={busy} onClick={() => act("balance")}>Pay {fmt(bal)}</button></> : <button type="button" className="btn" disabled={busy} onClick={finish}>Download final files and close</button>) : null}
                {studio ? (
                  <div className="actions">
                    {p.stage === 0 && p.quote ? <button type="button" className="btn" disabled={busy} onClick={() => act("advance")}>Discovery call done, send proposal</button> : null}
                    {canNext && p.stage === 1 ? <button type="button" className="btn" disabled={busy} onClick={() => act("advance")}>{next}</button> : null}
                    {canNext && p.stage > 1 ? <form className="share" key={p.files.length} onSubmit={withFile("advance")}><Field id="file" label="Draft file" type="file" /><button className="btn" disabled={busy}>{next}</button></form> : null}
                    {p.stage === 5 && bal <= 1 ? <form className="share" onSubmit={withFile("complete")}><Field id="file" label="Final files (zip)" type="file" /><button className="btn" disabled={busy}>Mark completed</button></form> : null}
                    {pending ? <span className="note">Waiting for client review</span> : null}
                  </div>
                ) : null}
                <div className="err" role="alert">{err}</div>
              </div>
              {p.brief ? (
                <div className="box"><h3>Brief</h3><dl className="kv">
                  <dt>Goal</dt><dd>{p.brief.goal}</dd>
                  {p.brief.audience ? <><dt>Audience</dt><dd>{p.brief.audience}</dd></> : null}
                  {p.brief.content ? <><dt>Content</dt><dd>{p.brief.content}</dd></> : null}
                  {p.brief.refs ? <><dt>References</dt><dd>{p.brief.refs}</dd></> : null}
                  <dt>Assets</dt><dd>{p.brief.assets}</dd>
                  {p.brief.date ? <><dt>Deadline</dt><dd>{dstr(p.brief.date)}</dd></> : null}
                  {p.brief.files.length ? <><dt>Files</dt><dd>{p.brief.files.map((f) => <a key={f.id} href={fileUrl(f.id)}>{f.name}</a>)}</dd></> : null}
                </dl></div>
              ) : studio ? <div className="box"><h3>Brief</h3><p className="note">Waiting for the client to submit the brief.</p></div> : null}
            </>
          )}
        </div>
        <div className="stack">
          <div className="box"><h3>Project</h3><dl className="kv">
            <dt>Client</dt><dd>{p.client}{p.company ? ", " + p.company : ""}</dd>
            <dt>Order</dt><dd className="num">{p.orderId}</dd>
            <dt>Team</dt><dd>{p.resource}</dd>
            <dt>Corrections used</dt><dd className="num">{p.round} of {rounds}</dd>
            {p.quote ? null : <><dt>Value (incl. GST)</dt><dd className="num">{fmt(p.total)}{p.monthly ? " / month" : ""}</dd><dt>Paid</dt><dd className="num">{fmt(p.paid)}</dd>{bal > 1 ? <><dt>Balance</dt><dd className="num">{fmt(bal)}</dd></> : null}</>}
          </dl></div>
          <div className="box"><h3>Messages</h3>
            <div className="msgs" aria-live="polite">{p.messages.length ? p.messages.map((m, i) => <div key={i} className={"msg " + m.from}><small>{m.from === "client" ? p.client : "Skepper studio"} · {dstr(m.t)}</small>{m.text}</div>) : <p className="note">No messages yet.</p>}</div>
            <form className="msgform" onSubmit={send}><input className="search" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Write a message" aria-label="Message" /><button className="btn" type="submit" disabled={busy}>Send</button></form>
          </div>
          <div className="box"><h3>Activity</h3><ul className="log">{p.log.toReversed().map((l, i) => <li key={i}><span>{dstr(l[0])}</span><span>{l[1]}</span></li>)}</ul></div>
        </div>
      </div>
    </div>
  );
}
