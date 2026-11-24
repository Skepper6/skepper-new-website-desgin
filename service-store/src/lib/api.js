// True only in a preview build (Vercel, or PREVIEW=1), where no PHP server exists.
export const PREVIEW = __PREVIEW__;
// Inside another website the server is where this file came from.
const BASE = __EMBED__ ? new URL("../", import.meta.url).href : "./";
const stand = PREVIEW ? await import("../preview/backend.js") : null;

async function call(method, path, body) {
  if (PREVIEW) return structuredClone(stand.default(method, path, body));
  const form = body instanceof FormData;
  let res;
  try {
    res = await fetch(BASE + "api" + path, {
      method,
      credentials: __EMBED__ ? "include" : "same-origin",
      headers: { ...(method === "GET" ? {} : { "X-Store": "1" }), ...(body && !form ? { "Content-Type": "application/json" } : {}) },
      body: body ? (form ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new Error("We could not reach the store. Check your connection and try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || data === null) {
    const e = new Error(data?.error || "Something went wrong on our side. Please try again in a minute.");
    e.status = res.status;
    throw e;
  }
  return data;
}
export const get = (path) => call("GET", path);
export const post = (path, body = {}) => call("POST", path, body);
export const fileUrl = (id) => (PREVIEW ? stand.blobUrl(id) : BASE + "api/files/" + id);
export function download(f) {
  const a = document.createElement("a");
  a.href = fileUrl(f.id);
  a.download = f.name;
  a.click();
}

let script;
/** Opens Razorpay. Resolves with its answer, or null when the visitor closes it. */
export function razorpay(o) {
  script ??= new Promise((ok, no) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = ok;
    s.onerror = () => {
      script = null;
      no(new Error("The payment window could not open. Check your connection and try again."));
    };
    document.head.append(s);
  });
  return script.then(
    () =>
      new Promise((done) => {
        new window.Razorpay({ ...o, name: "Skepper", theme: { color: "#0073ff" }, handler: done, modal: { ondismiss: () => done(null) } }).open();
      }),
  );
}
