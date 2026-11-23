"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { cat, svc } from "@/lib/catalogue";
import { fmt } from "@/lib/format";
import type { ShardId } from "@/lib/mark";
import { describe, priceOf, totals } from "@/lib/pricing";
import { useSite } from "@/lib/site";
import { actions, useStore } from "@/lib/store";
import { Dialog } from "../Dialog";
import { Icon } from "../Icon";
import { Mark, ShardShape } from "../Mark";

/** The order lives at the foot of the page as pieces of the mark. Open it and the pieces spread out. */
export function Tray() {
  const cart = useStore((s) => s.cart);
  const open = useStore((s) => s.cartOpen);
  const router = useRouter();
  const { to } = useSite();
  const t = totals(cart);
  const lit = useMemo(
    () =>
      new Set<ShardId>(
        cart.flatMap((i) => {
          const s = svc(i.sid);
          return s ? [cat(s.cat).shard] : [];
        }),
      ),
    [cart],
  );
  const go = () => {
    actions.closeCart();
    router.push(to("/checkout/"));
  };
  return (
    <>
      {cart.length ? (
        <button type="button" className="tray" onClick={actions.openCart} aria-label={`Your order, ${cart.length} ${cart.length === 1 ? "service" : "services"}, ${fmt(t.grand)} with GST`}>
          <Mark lit={lit} />
          <span><b className="num">{cart.length}</b> in your order</span>
          <span className="num">{fmt(t.grand)}</span>
        </button>
      ) : null}
      <Dialog open={open} onClose={actions.closeCart} className="tray-sheet" label="Your order">
        <div className="tray-top">
          <h2>Your order</h2>
          <button type="button" className="round" onClick={actions.closeCart} aria-label="Close"><Icon name="close" /></button>
        </div>
        {cart.length ? (
          <>
            <ul className="tokens">
              {cart.map((it, i) => {
                const s = svc(it.sid);
                if (!s) return null;
                return (
                  <li key={i}>
                    <ShardShape id={cat(s.cat).shard} />
                    <b>{s.name}</b>
                    <p>{describe(it).replaceAll(" · ", ", ") || (s.unit === "month" ? "Monthly" : "Standard scope")}</p>
                    <span className="num">{s.unit === "quote" ? "On quote" : s.unit === "free" ? "Free" : fmt(priceOf(it).total) + (s.unit === "month" ? " / month" : "")}</span>
                    <div>
                      <button type="button" className="link" onClick={() => actions.configure(it.sid, i)} aria-label={`Change ${s.name}`}>Change</button>
                      <button type="button" className="link" onClick={() => actions.removeLine(i)} aria-label={`Remove ${s.name}`}>Remove</button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="tray-sum">
              <p>{fmt(t.sub)} plus {fmt(t.gst)} GST</p>
              <p className="tray-total num">{fmt(t.grand)}</p>
              <button type="button" className="cta" onClick={go}>Checkout</button>
            </div>
          </>
        ) : (
          <div className="tray-sum">
            <p>Nothing ordered yet. Choose a service and it will appear here.</p>
            <button type="button" className="cta" onClick={() => { actions.closeCart(); router.push(to("/services/")); }}>Explore services</button>
          </div>
        )}
      </Dialog>
    </>
  );
}
