/** Static export: the whole site builds to ./out and runs on any host, cPanel included. */
const config = { output: "export", trailingSlash: true, images: { unoptimized: true }, reactStrictMode: true, outputFileTracingRoot: import.meta.dirname };
export default config;
