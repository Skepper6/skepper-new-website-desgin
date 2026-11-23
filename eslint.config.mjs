import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts", ".taste-skill/**"] },
  ...coreWebVitals,
  ...typescript,
  { rules: { "@next/next/no-img-element": "off" } },
];
export default config;
