import { COMPANY } from "@/lib/content";

export const TERMS: [string, string][] = [
  ["Prices and GST", "Prices are in Indian rupees and exclude 18% GST. A GST invoice is issued for every payment."],
  ["Payment", "Projects start with a 50% advance, and the balance is due when final files are ready. You may pay in full up front. Monthly services are paid in advance each month."],
  ["Corrections", "Each one-time project includes up to 4 correction rounds. Extra rounds are costed separately before work continues."],
  ["Delivery", "Delivery times are typical working days counted after your brief is received. Express delivery is an add-on and is about 3 working days."],
  ["Starting prices and quotes", "A from price is a starting price, and the final scope is confirmed in writing before work begins. Services on quote are priced after a discovery call."],
  ["Monthly services", "Monthly services are billed in advance and can be cancelled with 30 days’ notice. Ad spend is billed separately."],
  ["Content", "Content is supplied by you unless the service includes writing."],
  ["Final files", "Final files are released once the draft is approved and the balance is paid. Editable source files are an add-on."],
];
export const PRIVACY: [string, string][] = [
  ["What is stored", "Your cart, the details you enter at checkout, and your projects are saved in this browser only, using local storage. Nothing is sent to a server by this prototype."],
  ["Payments", "Payments are simulated. No card, UPI or bank details are asked for or stored."],
  ["Files", "When you attach files to a brief, only their names are kept in this browser. The files themselves are not uploaded."],
  ["Contact", "The contact letter opens your own mail app with the message filled in. It is sent only when you send it."],
  ["Tracking", "This site sets no analytics or advertising cookies."],
  ["Clearing your data", "Clear this site’s data in your browser settings and everything above is removed."],
];

export function Legal({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <article className="legal">
      <h1>{title}</h1>
      {items.map(([t, d]) => <p key={t} className="t-lead"><b>{t}.</b> {d}</p>)}
      <p>Questions? Write to <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
    </article>
  );
}
