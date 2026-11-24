import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { get, post } from "./api";

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const KEY = "skepper-cart-v2";
const VIEWS = ["shop", "portal", "studio", "checkout", "thanks"];
const readView = () => {
  const h = location.hash.replace("#", "");
  return VIEWS.includes(h) ? h : "shop";
};
const readCart = () => {
  try {
    const c = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(c) ? c : [];
  } catch {
    return [];
  }
};
const readOrder = () => {
  try {
    return JSON.parse(sessionStorage.getItem("skepper-order"));
  } catch {
    return null;
  }
};

export function StoreProvider({ children }) {
  const [menu, setMenu] = useState(null);
  const [fail, setFail] = useState("");
  const [session, setSession] = useState(null);
  const [cart, setCartRaw] = useState(readCart);
  const [view, setView] = useState(readView);
  const [layer, setLayer] = useState(null); // {type:"service"|"cart"|"project"|"menu", ...}
  const [order, setOrderRaw] = useState(readOrder);
  const [current, setCurrent] = useState(null);

  const load = useCallback(async () => {
    setFail("");
    try {
      const q = new URLSearchParams(location.search);
      if (q.get("order")) {
        // The link from the order email. The key is taken out of the address bar at once.
        history.replaceState(null, "", location.pathname + "#portal");
        setView("portal");
        await post("/auth/link", { order: q.get("order"), key: q.get("key") || "" }).catch(() => {});
      }
      const [m, s] = await Promise.all([get("/catalogue"), get("/session")]);
      const by = new Map(m.services.map((x) => [x.id, x]));
      setCartRaw((c) => c.filter((it) => by.has(it.sid)));
      setSession(s);
      setMenu({ ...m, svc: (id) => by.get(id) });
    } catch (e) {
      setFail(e.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const on = () => {
      const h = location.hash.slice(1);
      if (h && !VIEWS.includes(h)) return; // a link of the page around us
      setView(readView());
      setLayer(null);
      scrollTo(0, 0);
    };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);

  const setCart = useCallback((c) => {
    setCartRaw(c);
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {
      // a private window: the cart lasts until the tab closes
    }
  }, []);
  const setOrder = useCallback((o) => {
    setOrderRaw(o);
    try {
      sessionStorage.setItem("skepper-order", JSON.stringify(o));
    } catch {
      // only used to survive a reload of the thank-you page
    }
  }, []);

  const value = useMemo(
    () => ({ menu, fail, load, session, setSession, cart, setCart, view, go: (v) => (location.hash = v), layer, setLayer, order, setOrder, current, setCurrent }),
    [menu, fail, load, session, cart, setCart, view, layer, order, setOrder, current],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
