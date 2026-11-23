import type { ShardId } from "./mark";

export type CategoryId = "brand" | "social" | "video" | "print" | "web" | "digital" | "pharma" | "pods" | "event";
export type Unit = "free" | "project" | "from" | "unit" | "month" | "quote";
/** [label, price added in rupees] */
export type Choice = [string, number];
export type OptionGroup = { label: string; choices: Choice[] };
export type Service = {
  id: string; cat: CategoryId; name: string; price: number; unit: Unit; days: number;
  desc: string; inc: string[]; tag?: string; opts?: OptionGroup[]; extras?: Choice[];
  qty?: { label: string; min: number };
};
export type AddonId = "express" | "round" | "source" | "stock";
export type Addon = { id: AddonId; name: string; desc: string; pct?: number; min?: number; flat?: number };
export type Category = { id: CategoryId; name: string; short: string; blurb: string; shard: ShardId };

/** Nine departments, one for each shard of the Skepper mark. */
export const CATS: Category[] = [
  { id: "brand", name: "Brand Strategy & Identity", short: "Brand", blurb: "From a quick health check to a complete brand book. Built on the 4D Brew Your Brand process.", shard: "purple" },
  { id: "social", name: "Social Media", short: "Social", blurb: "Buy a single post when you need one, or a monthly plan that keeps your feed alive.", shard: "yellow" },
  { id: "video", name: "Video & Motion", short: "Video", blurb: "Short films, explainers and animation, priced by duration. Pick 2D motion, live action or 3D.", shard: "redTop" },
  { id: "print", name: "Print, Packaging & Stationery", short: "Print", blurb: "Print-ready artwork for everything your customer can hold.", shard: "orange" },
  { id: "web", name: "Website & UI/UX", short: "Web", blurb: "Audits, landing pages, full websites, app screens and monthly upkeep.", shard: "blueRight" },
  { id: "digital", name: "Digital Marketing", short: "Digital", blurb: "Search, ads, LinkedIn lead systems and content that brings people back.", shard: "lime" },
  { id: "pharma", name: "Healthcare & Pharma", short: "Pharma", blurb: "Compliance-ready creative from a team with 28 Rx Club awards.", shard: "blueLeft" },
  { id: "pods", name: "Creative Subscription Pods", short: "Pods", blurb: "A dedicated slice of the studio every month. Paid monthly in advance.", shard: "navy" },
  { id: "event", name: "Brew Your Event", short: "Events", blurb: "Event identity, from the first idea to the stage backdrop.", shard: "redLow" },
];

const S = (
  id: string, cat: CategoryId, name: string, price: number, unit: Unit, days: number, desc: string, inc: string[],
  more: Pick<Service, "tag" | "opts" | "extras" | "qty"> = {},
): Service => ({ id, cat, name, price, unit, days, desc, inc, ...more });

const STYLE: OptionGroup = {label:"Production style", choices:[["2D motion graphics",0],["Live action shoot (1 day, Bengaluru)",60000],["3D animation",80000]]};
const VIDEO_EXTRAS: Choice[] = [["Professional voice-over (1 language)",6000],["Subtitles",3000],["Additional language version",8000],["Licensed music track",4000]];
export const SERVICES: Service[] = [
  // Brand
  S("bqa","brand","Brand Quick Assessment",0,"free",3,"A short diagnostic of how your brand looks, sounds and performs today, with three priorities to fix first.",["Online questionnaire","Review of logo, website and socials","3-priority action note","20-minute call with a strategist"],{tag:"Free"}),
  S("workshop","brand","Brew Your Brand Strategy Workshop",75000,"project",10,"A half-day 4D workshop with your leadership that ends in a clear positioning, audience map and brand story.",["Pre-workshop discovery survey","Half-day facilitated session","Positioning and brand story document","Audience and competitor map"],{opts:[{label:"Format",choices:[["Online",0],["At your office (Bengaluru)",10000],["Retreat at our Wayanad centre",60000]]}]}),
  S("naming","brand","Brand Naming",40000,"project",14,"Name directions grounded in your strategy, screened for domain and basic trademark availability.",["30 name explorations","Shortlist of 5 with rationale","Domain availability check","Basic trademark screening"]),
  S("tagline","brand","Tagline & Brand Messaging",25000,"project",7,"A tagline, brand voice and the core lines your team will use everywhere.",["3 tagline routes","Brand voice guide","Elevator pitch and boilerplate"]),
  S("logo","brand","Logo Design",15000,"project",7,"A distinctive logo built for screens, print and social avatars.",["Logo concepts","Colour and mono versions","Final files in AI, SVG, PNG, PDF"],{tag:"Popular",opts:[{label:"Package",choices:[["Starter: 2 concepts",0],["Signature: 4 concepts + monogram + favicon",20000]]}]}),
  S("identity","brand","Brand Identity Kit",75000,"project",21,"Logo plus the full visual system: colours, type, patterns and the first set of applications.",["Logo design (3 concepts)","Colour palette and typography","Business card and letterhead","Social media templates (5)","Mini brand guide (12 pages)"],{tag:"Best value"}),
  S("brandbook","brand","Complete Brand Book",150000,"project",35,"Strategy, identity and a detailed guideline book your agency partners can follow without you.",["Strategy workshop","Full identity system","40+ page brand guidelines","Stationery, signage and social applications","Brand asset library"]),
  S("rebrand","brand","Rebrand / Brand Refresh",125000,"from",30,"Modernise an existing brand without losing the recognition you have built.",["Brand audit","Evolution routes","Refreshed identity system","Rollout plan"]),
  // Social
  S("post","social","Single Static Post",2500,"unit",2,"One scroll-stopping post designed to your brand, sized for Instagram, LinkedIn or Facebook.",["1 design in 2 sizes","Caption suggestion","Source file on request"],{qty:{label:"posts",min:1},tag:"Popular"}),
  S("carousel","social","Carousel Post",4500,"unit",3,"A multi-slide carousel that explains, teaches or tells a short story.",["Up to 6 slides","Cover slide optimised for saves"],{qty:{label:"carousels",min:1},opts:[{label:"Slides",choices:[["Up to 6 slides",0],["Up to 10 slides",2500]]}]}),
  S("reel","social","Animated Post / Reel",7500,"unit",4,"A 10 to 20 second animated post or reel with motion typography and music.",["Up to 20 seconds","Licensed music","Vertical and square versions"],{qty:{label:"reels",min:1}}),
  S("festival","social","Festival & Occasion Pack",10000,"project",5,"Five greeting posts for the festivals and days that matter to your audience.",["5 static posts","Brand-consistent festival styling","Scheduled delivery ahead of each date"]),
  S("adset","social","Ad Creative Set",15000,"project",5,"One campaign idea adapted into the sizes Meta, Google and LinkedIn ads need.",["1 key visual","6 sizes / placements","2 headline variations for A/B testing"]),
  S("social12","social","Monthly Plan · Starter",30000,"month",30,"12 posts a month with a content calendar. Ideal for steady presence.",["Monthly content calendar","8 static posts","2 carousels","2 reels","Caption copy"]),
  S("social20","social","Monthly Plan · Growth",45000,"month",30,"20 posts a month across formats for brands actively building an audience.",["Monthly content calendar","12 static posts","4 carousels","4 reels","Caption copy and hashtags"],{tag:"Popular"}),
  S("social30","social","Monthly Plan · Daily",65000,"month",30,"A post every day: static, carousel and video, covering campaigns, events, festivals and HR moments.",["Daily post (30 a month)","Mix of static, carousel and video","Content calendar","Caption copy and hashtags"]),
  S("smm","social","Social Media Management",25000,"month",30,"We publish, respond and report so your team does not have to. Add to any monthly plan.",["Scheduling on up to 3 platforms","Community replies on weekdays","Monthly performance report"]),
  // Video
  S("logoanim","video","Logo Animation",12000,"project",5,"A 3 to 5 second logo sting for videos, reels and presentations.",["Up to 5 seconds","Sound design","Light and dark versions"]),
  S("v15","video","15-Second Video",25000,"project",7,"Built for reels, stories and pre-roll ads. One idea, told fast.",["Script and storyboard","15-second edit","Vertical and horizontal versions"],{opts:[STYLE],extras:VIDEO_EXTRAS}),
  S("v30","video","30-Second Video",45000,"project",10,"The classic ad length. Enough time for a problem, a promise and a call to action.",["Script and storyboard","30-second edit","Vertical and horizontal versions"],{tag:"Popular",opts:[STYLE],extras:VIDEO_EXTRAS}),
  S("v60","video","60-Second Video / Explainer",75000,"project",14,"Explain a product, service or process clearly in one minute.",["Script and storyboard","Illustration style frames","60-second edit","Vertical and horizontal versions"],{opts:[STYLE],extras:VIDEO_EXTRAS}),
  S("product","video","Product Video",60000,"project",12,"Show the product in use, close up and in context.",["Shot list and storyboard","Studio or location shoot","60-second hero edit","3 short cut-downs"]),
  S("testimonial","video","Testimonial Video",40000,"project",10,"Real customers telling your story, interviewed and edited with care.",["Interview guide","1 interview shoot","90-second edit","2 social cut-downs"]),
  S("reelpack","video","Reels Editing Pack",32000,"project",10,"Send us your raw footage. We edit it into eight reels with captions and music.",["8 reels up to 45 seconds","Captions and motion text","Licensed music"]),
  S("film","video","Corporate Film",250000,"from",30,"A 3 to 5 minute film about who you are, for investors, recruits and partners.",["Concept and script","2-day shoot with crew","3 to 5 minute film","Social cut-downs"]),
  S("3d","video","3D Product Animation",120000,"project",21,"Photoreal 3D that shows what a camera cannot: inside, exploded or in motion.",["3D modelling from your CAD or references","30-second animation","5 still renders"]),
  // Print
  S("bcard","print","Business Card",4000,"project",3,"A card people keep. Two design options, print-ready.",["2 design options","Print-ready PDF with bleed","Name variations for up to 5 people"]),
  S("stationery","print","Stationery Set",12000,"project",5,"Business card, letterhead, envelope and email signature that match.",["Business card","Letterhead (Word template too)","Envelope","Email signature"]),
  S("flyer","print","Flyer / Poster",5000,"unit",3,"A single-page flyer or poster for print or digital.",["1 design, A4 or A3","Print and digital versions"],{qty:{label:"designs",min:1}}),
  S("brochure","print","Brochure",6000,"unit",7,"Priced per spread (2 facing pages). Layout, typography and print-ready output.",["Layout and typography","Image sourcing guidance","Print-ready PDF"],{qty:{label:"spreads",min:2}}),
  S("catalogue","print","Product Catalogue",2500,"unit",14,"Priced per page for product grids, specifications and ordering information.",["Template design","Product page layouts","Print and web PDF"],{qty:{label:"pages",min:8}}),
  S("pack","print","Packaging & Label Design",25000,"unit",14,"Packaging that sells on the shelf and online. Priced per SKU.",["2 design routes","Dieline artwork","Mock-up renders"],{qty:{label:"SKUs",min:1}}),
  S("calendar","print","Calendar",30000,"project",14,"A 12-month calendar your clients will keep on the desk all year.",["Cover plus 12 months","Theme and imagery direction","Print-ready files"]),
  S("annual","print","Annual Report",150000,"from",30,"Design for annual and sustainability reports, from narrative to data visualisation.",["Report design up to 40 pages","Infographics and charts","Print and interactive PDF"]),
  // Web
  S("audit","web","Website Audit",12000,"project",5,"A clear report on design, speed, SEO and conversion, with fixes ranked by impact.",["UX and design review","Speed and mobile check","SEO basics","Prioritised fix list"]),
  S("landing","web","Landing Page",35000,"project",10,"One high-converting page for a launch, campaign or lead magnet.",["Copy structure","Responsive design and build","Lead form with email alert","Basic analytics"]),
  S("site","web","Business Website (5 pages)",85000,"project",21,"A fast, responsive website you can update yourself.",["5 pages designed and built","CMS training","On-page SEO setup","Contact forms and WhatsApp button"],{tag:"Popular",opts:[{label:"Platform",choices:[["WordPress",0],["Webflow",15000],["Custom coded",30000]]}],extras:[["5 extra pages",30000],["Copywriting for all pages",20000],["Blog setup",10000]]}),
  S("ecom","web","E-commerce Website",200000,"from",45,"Online store with catalogue, cart, payments and order management.",["Store design","Up to 50 products loaded","Razorpay / Stripe integration","Shipping and GST setup"]),
  S("uiux","web","UI/UX Design",6000,"unit",14,"App or dashboard screens, priced per screen, with a clickable prototype.",["User flow","High-fidelity screens","Clickable Figma prototype"],{qty:{label:"screens",min:5}}),
  S("maint","web","Website Maintenance",8000,"month",30,"Updates, backups, security and small changes every month.",["Plugin and security updates","Weekly backups","Up to 4 hours of changes","Uptime monitoring"]),
  // Digital
  S("seoaudit","digital","SEO / GEO Audit",15000,"project",7,"How visible you are on Google and in AI answers, and what to fix.",["Technical SEO audit","Keyword gap analysis","AI search (GEO) visibility check","Action plan"]),
  S("seo","digital","Monthly SEO",30000,"month",30,"Ongoing optimisation, content and links to grow organic traffic.",["Keyword tracking","On-page fixes","2 optimised articles","Monthly report"]),
  S("gads","digital","Google Ads Management",25000,"month",30,"Search and Performance Max campaigns managed for leads, not clicks. Ad spend billed separately.",["Account setup or audit","Campaign management","Conversion tracking","Monthly report"]),
  S("meta","digital","Meta Ads Management",25000,"month",30,"Facebook and Instagram campaigns with creative testing. Ad spend billed separately.",["Audience setup","4 ad creatives a month","Campaign management","Monthly report"]),
  S("linkedin","digital","LinkedIn B2B Lead System",60000,"project",21,"Profile, content calendar, lead magnet and message sequences that turn connections into calls.",["Profile optimisation","30-day content calendar","Lead magnet funnel","Connection and follow-up sequences"]),
  S("email","digital","Email Campaign",18000,"project",7,"A designed email sequence that nurtures and converts.",["Sequence of 4 emails","Copy and design","Setup in your email tool"]),
  S("blog","digital","Blog / Article Writing",4000,"unit",5,"Researched, SEO-ready articles of about 1,000 words.",["Keyword research","1,000-word article","Meta title and description"],{qty:{label:"articles",min:1}}),
  // Pharma
  S("va","pharma","Visual Aid / Detailing Aid",6000,"unit",10,"Priced per page. Clinical claims laid out for a 3-minute doctor call.",["Reference-linked claims","Layout and illustration","Print and iPad versions"],{qty:{label:"pages",min:4}}),
  S("lbl","pharma","Leave-Behind Literature",12000,"project",7,"A compact reminder piece the doctor keeps after the call.",["Single or bi-fold layout","Reference callouts","Print-ready files"]),
  S("moa","pharma","MOA Animation",120000,"project",28,"Mechanism of action in clear, scientifically accurate 2D or 3D animation.",["Scientific script review","Storyboard","60-second animation","Medical-review ready version"]),
  S("ped","pharma","Patient Education Leaflet",15000,"project",7,"Plain-language leaflets that patients actually read.",["Simplified copy","Illustrations","Print-ready files"]),
  S("cme","pharma","CME / Conference Branding",75000,"project",21,"Identity and collateral for medical meetings, symposia and booths.",["Event identity","Backdrop and standee","Invitations and certificates","Booth graphics"]),
  S("launch","pharma","Complete Brand Launch Kit",350000,"from",45,"Everything a new molecule needs for market launch, from medical writing to key visual.",["Medical writing support","Brand name and logo","Key visual","Visual aid, LBL and gimmick concepts","Launch meeting deck"]),
  // Pods
  S("pod-design","pods","Design Pod",60000,"month",30,"A dedicated senior designer's capacity for your brand, every month.",["Up to 25 design requests","48-hour turnaround on small jobs","Dedicated Trello board"],{tag:"Popular"}),
  S("pod-video","pods","Video & Content Pod",90000,"month",30,"Monthly video, reels and content production on a predictable budget.",["4 short videos or 12 reels","Script support","Priority queue"]),
  S("pod-stationery","pods","Brand Stationery Pod",25000,"month",30,"Business cards, letterheads, certificates and everyday collateral on demand.",["Up to 20 stationery jobs","Print vendor coordination"]),
  S("pod-pharma","pods","Pharma Creative Pod",120000,"month",30,"Compliance-ready creative capacity for brand teams and product managers.",["Visual aids, LBLs and inputs","Reference management","MLR-ready versions"]),
  // Event
  S("eventkit","event","Event Branding Kit",60000,"project",14,"Name, identity and collateral for one event.",["Event logo and theme","Invitations (print and digital)","Backdrop and standees","Social media kit"]),
  S("eventfull","event","Complete Event Management",0,"quote",0,"From event idea to attendee acquisition to stage setup. Priced after a discovery call.",["Concept and planning","Venue and vendor management","Attendee acquisition campaign","Stage, AV and on-ground team"],{tag:"Quote"})
];
export const ADDONS: Addon[] = [
  {id:"express", name:"Express delivery", desc:"Hybrid human-AI studio workflow, about 3 working days", pct:.35, min:3000},
  {id:"round", name:"Extra correction round", desc:"A 5th round on top of the 4 included", pct:.10, min:1500},
  {id:"source", name:"Editable source files", desc:"Open AI / PSD / AEP / Figma files", pct:.15, min:2500},
  {id:"stock", name:"Premium stock licensing", desc:"Up to 5 licensed images or clips", flat:3500}
];

const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");
export const priceText = (s: Service) =>
  s.unit === "free" ? "Free" : s.unit === "quote" ? "On quote" : (s.unit === "from" ? "from " : "") + rupees(s.price) + (s.unit === "month" || s.unit === "unit" ? " " + unitText(s) : "");
export const timeText = (s: Service) => (s.unit === "month" ? "Monthly" : s.days ? s.days + " days" : "Agreed on a call");

/** Home page specials, in order. */
export const SPECIALS = ["logo", "v30", "social20", "site"] as const;
export const ROUNDS = 4;
export const GST = 0.18;

export const svc = (id: string): Service | undefined => SERVICES.find((s) => s.id === id);
export const cat = (id: CategoryId): Category => CATS.find((c) => c.id === id)!;
export const countIn = (id: CategoryId) => SERVICES.filter((s) => s.cat === id).length;
export const isOneTime = (s: Service) => s.unit === "project" || s.unit === "unit" || s.unit === "from";
export const unitText = (s: Service): string => {
  switch (s.unit) {
    case "month": return "/ month";
    case "unit": return "/ " + (s.qty ? s.qty.label.replace(/s$/, "") : "unit");
    case "from": return "onwards";
    default: return "";
  }
};
