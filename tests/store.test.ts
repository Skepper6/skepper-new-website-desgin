import { describe as suite, expect, it } from "vitest";
import { CATS, SERVICES } from "../lib/catalogue";
import { describe, newItem, payPlan, priceOf, totals } from "../lib/pricing";
import { pendingFile, projectsFromCart, reduceProject, statusOf } from "../lib/projects";
import { cleanCart } from "../lib/store";

const contact = { name: "Asha", company: "Asha & Co", email: "a@b.co", phone: "9876543210", gstin: "", city: "" };

suite("catalogue", () => {
  it("keeps every service and department from the original store", () => {
    expect(SERVICES).toHaveLength(59);
    expect(CATS).toHaveLength(9);
    expect(new Set(SERVICES.map((s) => s.id)).size).toBe(59);
    expect(new Set(CATS.map((c) => c.shard)).size).toBe(9);
  });
});

suite("pricing", () => {
  it("adds options, extras and a percentage add-on", () => {
    const it30 = { ...newItem("v30"), opts: [1], extras: [0], addons: ["express" as const] };
    expect(priceOf(it30)).toMatchObject({ sub: 111000, add: 38850, total: 149850 });
  });
  it("applies the add-on minimum on small orders", () => {
    expect(priceOf({ ...newItem("post"), addons: ["express"] }).add).toBe(3000);
  });
  it("starts quantity services at their minimum", () => {
    expect(priceOf(newItem("brochure")).total).toBe(12000);
    expect(describe(newItem("post"))).toBe("1 post");
  });
  it("takes half of projects and all of monthly plans now", () => {
    const cart = [newItem("logo"), newItem("social20")];
    expect(totals(cart).grand).toBeCloseTo(70800);
    expect(payPlan(cart, false).now).toBeCloseTo(8850 + 53100);
    expect(payPlan(cart, true).later).toBe(0);
  });
});

suite("projects", () => {
  it("runs from order to delivery", () => {
    let p = projectsFromCart([newItem("logo")], contact, false, "UPI").projects[0];
    expect(statusOf(p).label).toBe("Brief needed");
    p = reduceProject(p, { type: "brief", brief: { goal: "x", audience: "", content: "", refs: "", assets: "", date: "" } });
    p = reduceProject(p, { type: "advance" });
    p = reduceProject(p, { type: "advance" });
    expect(pendingFile(p)?.name).toContain("AshaCo_LogoDesign_SCA_D1.pdf");
    expect(reduceProject(p, { type: "changes", text: "  " })).toBe(p);
    p = reduceProject(p, { type: "changes", text: "Bigger" });
    expect([p.stage, p.round]).toEqual([4, 1]);
    p = reduceProject(reduceProject(p, { type: "advance" }), { type: "approve" });
    expect(statusOf(p).label).toBe("Balance due");
    p = reduceProject(reduceProject(p, { type: "payBalance" }), { type: "complete" });
    expect(statusOf(p).label).toBe("Completed");
    expect(p.files.at(-1)?.name).toContain("_Final.zip");
  });
});

suite("saved carts", () => {
  it("drops unknown services and repairs missing fields", () => {
    expect(cleanCart([{ sid: "gone" }, { sid: "brochure", qty: 0 }, null])).toEqual([{ sid: "brochure", qty: 2, opts: [], extras: [], addons: [] }]);
  });
});
