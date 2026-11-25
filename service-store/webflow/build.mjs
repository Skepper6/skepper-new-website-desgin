// Writes the Webflow (editor-visible) version of the parts the store's code also draws.
// When the page is live, the code replaces them with the working ones, so prices always come from the store.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const m = JSON.parse(readFileSync(new URL("../src/preview/catalogue.json", import.meta.url)));
const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const d = (c, t = "") => `<div class="sks-${c}">${t}</div>`;
const two = (n) => String(n).padStart(2, "0");
const price = (s) => s.unit === "free" ? "Free" : s.unit === "quote" ? "On quote" : (s.unit === "from" ? "from " : "") + fmt(s.price) + (s.unit === "month" ? " / month" : s.unit === "unit" ? " / " + (s.qty ? s.qty.label.replace(/s$/, "") : "unit") : "");
const once = (s) => ["project", "unit", "from"].includes(s.unit);
const item = (s, i) => d("item", d("no", two(i + 1)) + d("in", d("top", d("nm", esc(s.name)) + d("dl") + d("pr", price(s))) + d("ds", esc(s.desc)) + d("cs", (s.tag ? d("ct", esc(s.tag)) : "") + (s.days ? d("ch", s.unit === "month" ? "Monthly" : s.days + " days") : "") + (once(s) ? d("ch", m.rounds + " correction rounds") : ""))) + d("go", "↗"));
const cat = (c, i) => `<section class="sks-cat">${d("cathead", d("big", two(i + 1)) + `<h2 class="sks-cname">${esc(c.name)}</h2>` + d("cblurb", esc(c.blurb)))}${d("items", m.services.filter((s) => s.cat === c.id).map(item).join(""))}</section>`;
const by = new Map(m.services.map((s) => [s.id, s]));
const MQ = ["Brand Quick Assessment", "Brew Your Brand Strategy Workshop", "Brand Naming", "Logo Design", "Brand Identity Kit", "Complete Brand Book", "Carousel Post", "30-Second Video", "Corporate Film", "Landing Page"].map((x) => x + " ✻").join(" ");
const out = {
  bar: `<div class="sks-bar-in">${d("bar-name", "Service Store") + d("tab-on", "Services") + d("tab", "My Projects") + d("tab", "Studio Board") + d("grow") + d("cart", d("cart-text", "Cart") + d("cart-n", "0"))}</div>`,
  specials: `<div class="sks-ticket"><h2 class="sks-ticket-h">Today’s specials</h2>${d("dash")}${m.specials.map((id) => by.get(id)).map((s) => d("tl", d("tn", esc(s.name.replace("Monthly Plan · ", "Social · "))) + d("dt") + d("tp", fmt(s.price) + (s.unit === "month" ? "/mo" : "")))).join("")}${d("dash")}${d("ticket-foot", `Every project includes up to ${m.rounds} correction rounds. Start with 50% advance. GST invoice issued.`)}</div>`,
  marquee: d("mq-track", d("mq-part", MQ) + d("mq-part", MQ)),
  filters: `<div class="sks-filters"><div class="sks-frow">${d("search", "Search the menu: logo, reel, 30 seconds, brochure…") + d("pick", d("pick-t", "Everything") + d("pick-n", String(m.services.length)) + d("pick-i", "▾")) + d("seg", d("seg-on", "All") + d("seg-o", "One-time") + d("seg-o", "Monthly"))}</div></div>`,
  ...Object.fromEntries(m.cats.map((c, i) => ["cat" + (i + 1), cat(c, i)])),
};
mkdirSync(new URL("./parts", import.meta.url), { recursive: true });
for (const [k, v] of Object.entries(out)) writeFileSync(new URL(`./parts/${k}.html`, import.meta.url), v);
console.log(Object.entries(out).map(([k, v]) => k + " " + v.length).join("\n"));
