export const COMPANY = {
  name: "Skepper Creative Agency Pvt Ltd",
  address: "S003, Devin Indira Paradise, Chokkanahalli, Bengaluru 560063",
  gstin: "29AAXCS6226J1ZI",
  email: "binu@theskepper.com",
  phone: "+91 8150 00 22 00",
  tel: "+918150002200",
  hours: "Mon to Sat, 10 am to 7 pm",
};
export const SITE_URL = "https://www.theskepper.com";

export const WORK_KINDS = ["Identity", "Campaign", "Web", "Video", "Print", "Social"] as const;
export type WorkKind = (typeof WORK_KINDS)[number];
export type Work = { id: string; client: string; what: string; kind: WorkKind; alt: string };
export const WORK: Work[] = [
  { id: "reparil", client: "Reparil", what: "Website design", kind: "Web", alt: "A supporter in a floodlit stadium holds up a sign for Reparil" },
  { id: "cerbigem", client: "Cerbigem, Hetero", what: "Campaign visual", kind: "Campaign", alt: "Cerbigem vial and carton on a pink ground" },
  { id: "argitektur", client: "Argitektur", what: "Branding", kind: "Identity", alt: "The Argitektur symbol, a white frame that holds a model house" },
  { id: "hiv-self-test", client: "HIV Self Test", what: "2D animated video", kind: "Video", alt: "Illustrated man opening a door with light behind him" },
  { id: "ensure-plus", client: "Ensure Plus", what: "Packaging", kind: "Print", alt: "Row of Ensure Plus bottles on a wooden table" },
  { id: "balefio", client: "Balefio, Dr. Reddy’s", what: "Branding", kind: "Identity", alt: "Balefio sign on a concrete building" },
  { id: "fischer", client: "Fischer", what: "Campaign visual", kind: "Campaign", alt: "A figure made of steel anchors lifting a dumbbell" },
  { id: "land-optimizer", client: "Land Optimizer", what: "Branding", kind: "Identity", alt: "The Land Optimizer symbol built as a red and orange model" },
  { id: "cb12", client: "CB12", what: "Valentine’s Day video", kind: "Video", alt: "Two CB12 bottles dancing among hearts" },
  { id: "saugella", client: "Saugella", what: "Website design", kind: "Web", alt: "Two women in pink stripes laughing" },
  { id: "umc", client: "UMC", what: "Brochure and calendar", kind: "Print", alt: "Miniature workers unrolling a green coil of coated steel" },
  { id: "sitagliptin", client: "Sitagliptin", what: "Campaign visual", kind: "Campaign", alt: "Cyclist on a bike with globes for wheels" },
  { id: "viagra", client: "Viagra", what: "Visual identity", kind: "Identity", alt: "Couple embracing in front of a blue glass heart" },
  { id: "emmvee", client: "EMMVEE", what: "Social post", kind: "Social", alt: "EMMVEE solar post on a phone" },
  { id: "omez-dsr", client: "Omez DSR", what: "Campaign visual", kind: "Campaign", alt: "Glass stomach fed by two capsules on purple" },
  { id: "mr-plus", client: "MR Plus", what: "Brand identity", kind: "Identity", alt: "MR Plus logo in steel on black mesh" },
  { id: "plantaben", client: "Plantaben", what: "Campaign visual", kind: "Campaign", alt: "Man holding his stomach beside the Plantaben pack" },
  { id: "lalumar", client: "Lalumar", what: "Campaign visual", kind: "Campaign", alt: "Three people shovelling snow inside a cave shaped like lungs" },
  { id: "cicaderm", client: "Cicaderm", what: "Visual identity", kind: "Identity", alt: "Cicaderm spray bottle on purple" },
  { id: "duphalac", client: "Duphalac", what: "Campaign visual", kind: "Campaign", alt: "Duphalac billboard in green" },
  { id: "healthium", client: "Healthium", what: "Campaign visual", kind: "Campaign", alt: "Gloved hands assembling a blue and orange symbol" },
  { id: "olmedipine", client: "Olmedipine Plus", what: "Campaign visual", kind: "Campaign", alt: "Skydivers holding hands above a forest" },
  { id: "dermoflan", client: "Dermoflan", what: "Campaign visual", kind: "Campaign", alt: "Tiny figures sliding across soft skin" },
  { id: "fischer-social", client: "Fischer", what: "Social post", kind: "Social", alt: "Fischer festival post on a phone" },
];
export const work = (id: string) => WORK.find((w) => w.id === id)!;

export const CLIENTS: [string, string][] = [
  ["novo-nordisk", "Novo Nordisk"], ["abbott", "Abbott"], ["viatris", "Viatris"], ["roche", "Roche"], ["astrazeneca", "AstraZeneca"], ["dr-reddys", "Dr. Reddy’s"],
  ["zeiss", "Zeiss"], ["infosys", "Infosys"], ["allergan", "Allergan"], ["zydus", "Zydus"], ["wockhardt", "Wockhardt"], ["teleflex", "Teleflex"],
  ["rittal", "Rittal"], ["fosroc", "Fosroc"], ["bpl", "BPL"], ["sr-seating", "SR Seating"], ["umc", "UMC"], ["neolacta", "NeoLacta"],
  ["vacxigen", "Vacxigen"], ["plasmagen", "Plasmagen Biosciences"], ["trigenesis", "Trigenesis Biosciences"], ["rivaara-labs", "Rivaara Labs"], ["land-optimizer", "Land Optimizer"], ["moonfrog", "Moonfrog"],
  ["oakwood", "Oakwood"], ["pinnacle", "Pinnacle"], ["ewg", "EWG"], ["ami", "AMI"],
];

/** Published client quotes from theskepper.com, shortened but not reworded. */
export const QUOTES = [
  { text: "Their work has strengthened how we present the SR Seating brand to our customers.", who: "Chief Executive Officer", org: "SR Seating" },
  { text: "They understand the brand and the market and come up with creative ideas.", who: "Group Brand Manager", org: "Mylan Pharmaceuticals" },
  { text: "SKEPPER has become a dependable extension of our team.", who: "Assistant Manager, Medico Marketing", org: "Purelabs" },
  { text: "Their continued creative support gives us a reliable partner for our evolving communication requirements.", who: "Managing Director", org: "Realtime Infra" },
  { text: "Amazing, smart work in quick turn around time.", who: "Group Product Manager", org: "Novo Nordisk India" },
];

export const FAQ: [string, string][] = [
  ["How do payments work?", "Projects start with a 50% advance and the balance is due when final files are ready. You can also pay in full up front. Monthly plans and pods are paid in advance each month. Prices exclude 18% GST, and a GST invoice is issued for every payment."],
  ["How many corrections are included?", "Every one-time project includes up to 4 correction rounds. You can add a fifth when you order. Anything beyond that is costed by our accounts team before work continues."],
  ["How fast can I get it?", "Each service shows its typical delivery in working days after your brief. Add Express delivery to a project and our hybrid human-AI studio workflow aims for about 3 working days."],
  ["Can I cancel a monthly plan?", "Yes. Monthly services are billed in advance and can be cancelled with 30 days’ notice."],
  ["Do I get the source files?", "Final files are included. Open AI, PSD, AEP or Figma files can be added to any project as an add-on."],
  ["What does a from price mean?", "It is a starting price. The final scope is confirmed in writing before work begins. Services on quote start with a free discovery call and no payment."],
  ["Who writes the content?", "You supply it, unless the service includes writing. Your brief has a place for copy, product details, offers, references and files."],
];

export const VALUES: [string, string][] = [
  ["Craft over chaos", "We don’t believe in design for design’s sake. Everything we create is intentional, strategic, and built to last."],
  ["Depth over breadth", "We choose focus. Instead of spreading thin across industries and styles, we go deep into a few projects and make them unforgettable."],
  ["Co-creation over command", "We don’t work for clients. We work with them. Every brand we build is a shared journey, not a handoff."],
  ["Clarity over noise", "We strip away the jargon, trends, and fluff. What remains is pure, purposeful, and powerfully aligned with your identity."],
  ["People over process", "Great work is born not just from great systems, but from people who care. Our studio is driven by curiosity, trust, and open collaboration."],
];
export const FOUR_D: [string, string][] = [
  ["Discover", "We begin by listening. Through brand immersion, stakeholder interviews, and competitive audits, we unearth the roots of your brand’s identity."],
  ["Define", "We shape your brand’s narrative: positioning, messaging pillars, personality, and tone. Your brand knows who it is, and who it’s not."],
  ["Develop", "Strategy meets creativity. We bring your brand to life through logo systems, identity design, website layouts, videos, and marketing collaterals."],
  ["Deliver", "We launch with intention and guide the final delivery and post-launch alignment, staying close to ensure consistency, clarity, and cohesion."],
];
