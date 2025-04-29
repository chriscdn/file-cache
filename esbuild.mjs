import { build } from "esbuild";

import pkg from "./package.json" with { type: "json" };

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm", // or 'esm' if you prefer
  outfile: "./lib/index.js",
  external,
  minify: false,
  sourcemap: true,
}).catch(() => process.exit(1));