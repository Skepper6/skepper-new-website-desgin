import { useEffect } from "react";
import { Portal, Studio } from "./components/Boards";
import Cart from "./components/Cart";
import { Checkout, Thanks } from "./components/Checkout";
import { Footer, Header } from "./components/Frame";
import Service from "./components/Service";
import Shop from "./components/Shop";
import { useStore } from "./lib/store";

const VIEW = { shop: Shop, checkout: Checkout, thanks: Thanks, portal: Portal, studio: Studio };
const TITLE = { shop: "Skepper Service Store", checkout: "Checkout", thanks: "Your order is brewing", portal: "My Projects", studio: "Studio Board" };

export default function App() {
  const { menu, fail, load, view, layer } = useStore();
  useEffect(() => {
    document.title = view === "shop" ? TITLE.shop : TITLE[view] + " | Skepper Service Store";
  }, [view]);
  const View = VIEW[view];
  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main").focus(); }}>Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        {menu ? <View /> : <div className="boot">{fail ? <><p>{fail}</p><button type="button" className="btn" onClick={load}>Try again</button></> : <img src="./logo.svg" alt="Loading" width="151" height="42" />}</div>}
      </main>
      <Footer />
      {menu && layer?.type === "service" ? <Service key={layer.id + layer.edit} id={layer.id} edit={layer.edit} /> : null}
      {menu && layer?.type === "cart" ? <Cart /> : null}
    </>
  );
}
