import { SERVICES, svc, type CategoryId } from "./catalogue";
import { work } from "./content";
import { DEPT_PIC } from "./theme";

/** The real picture that stands for a department. Events use a frame from our own shoot. */
export function deptPic(id: CategoryId): { src: string; alt: string } {
  if (id === "event") return { src: "/film/studio.webp", alt: "Skepper crew on set" };
  const w = work(DEPT_PIC[id]);
  return { src: `/work/${w.id}.webp`, alt: w.alt };
}

const SETS: Record<CategoryId, string[]> = {
  brand: ["land-optimizer", "healthium", "viagra", "mr-plus", "balefio", "cicaderm", "fischer"],
  social: ["fischer-social", "plantaben-time", "cb12", "saugella", "dermoflan", "emmvee"],
  video: ["cb12", "lalumar", "omez-dsr", "olmedipine", "plantaben-time", "sitagliptin", "hiv-self-test"],
  print: ["ensure-plus", "umc", "cerbigem", "duphalac", "plantaben", "balefio-road", "dermoflan", "cicaderm"],
  web: ["saugella", "emmvee", "healthium", "argitektur", "fischer"],
  digital: ["sitagliptin", "duphalac", "olmedipine", "fischer-social", "land-optimizer", "lalumar", "saugella"],
  pharma: ["omez-dsr", "cerbigem", "cicaderm", "olmedipine", "plantaben", "lalumar"],
  pods: [],
  event: [],
};
const FIXED: Record<string, string> = {
  logo: "/work/argitektur.webp",
  v30: "/work/hiv-self-test.webp",
  site: "/work/reparil.webp",
  social20: "/work/emmvee.webp",
  "pod-design": "/pods/design.webp",
  "pod-video": "/pods/video.webp",
  "pod-stationery": "/pods/stationery.webp",
  "pod-pharma": "/pods/pharma.webp",
  eventkit: "/film/crew-2.webp",
  eventfull: "/film/crew-4.webp",
};
/** A picture of our work beside each service. It shows the studio’s hand, not that exact order. */
export function svcPic(id: string): string {
  if (FIXED[id]) return FIXED[id];
  const s = svc(id)!;
  const set = SETS[s.cat];
  const i = SERVICES.filter((x) => x.cat === s.cat && !FIXED[x.id]).findIndex((x) => x.id === id);
  return set.length ? `/work/${set[i % set.length]}.webp` : deptPic(s.cat).src;
}
