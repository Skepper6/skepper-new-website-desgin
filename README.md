# Skepper website: two designs, one store

Next.js (static export), React, TypeScript, GSAP, Lenis and Three.js.

- `/rooms/` is design 1, Rooms of light.
- `/dial/` is design 2, The dial.
- `/` links to both. Once one is chosen, move its pages to the root.

```
npm install
npm run dev        # http://localhost:3000
npm test           # pricing, order and project rules
npm run lint
npm run typecheck
npm run build      # writes the whole site to ./out
npm run preview    # serves ./out on http://localhost:4173
```

To publish, upload the contents of `out/` to the web root (cPanel `public_html` works; `.htaccess` is included).

## Where things are

| Change | File |
| --- | --- |
| Services, prices, options, add-ons | `lib/catalogue.ts` |
| Work, clients, quotes, FAQ, company details | `lib/content.ts` |
| Price, GST and payment rules | `lib/pricing.ts` |
| Project stages and actions | `lib/projects.ts` |
| Cart and project storage | `lib/store.ts` |
| Type sizes (matched to theskepper.com) | `app/styles/base.css` |
| Ordering, tray, checkout, projects, studio | `components/flow/`, `app/styles/flow.css` |
| Design 1 | `components/rooms/`, `app/styles/rooms.css`, `lib/glassScene.ts` |
| Design 2 | `components/dial/`, `app/styles/dial.css` |

## Before going live

- Connect Razorpay in `components/flow/Checkout.tsx`. `actions.placeOrder` should run only after a verified payment.
- Replace local storage in `lib/store.ts` with an API and database, and add sign-in.
- Put the Studio Board behind a staff login. It is public in this prototype.
- Store uploaded files. The brief form keeps file names only.
- Send the contact letter from a server. It opens the visitor's mail app for now.
- Have the order terms and privacy pages reviewed.
