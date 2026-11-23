import type { CategoryId } from "./catalogue";
import type { ShardId } from "./mark";

/** Seven project stages, seven colours of the mark. A finished project is a finished mark. */
export const STAGE_SHARDS: ShardId[][] = [["redTop", "redLow"], ["orange"], ["yellow"], ["lime"], ["blueLeft", "blueRight"], ["navy"], ["purple"]];

/** The colour each room is flooded with: that department's light on a white wall. */
export const TINT: Record<CategoryId | "hall", [number, number, number]> = {
  hall: [255, 255, 255],
  brand: [239, 226, 244],
  social: [255, 243, 201],
  video: [255, 224, 224],
  print: [255, 234, 213],
  web: [217, 237, 252],
  digital: [243, 247, 207],
  pharma: [214, 241, 250],
  pods: [220, 229, 247],
  event: [255, 228, 222],
};
export const tint = (id: CategoryId | "hall") => `rgb(${TINT[id].join(" ")})`;

/** One piece of real work shown with each department. */
export const DEPT_PIC: Record<CategoryId, string> = {
  brand: "land-optimizer",
  social: "emmvee",
  video: "hiv-self-test",
  print: "ensure-plus",
  web: "reparil",
  digital: "fischer-social",
  pharma: "omez-dsr",
  pods: "olmedipine",
  event: "cerbigem",
};
