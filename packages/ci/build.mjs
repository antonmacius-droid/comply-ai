import { build } from "esbuild";

await build({
  entryPoints: ["github-actions/comply-check/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: "github-actions/comply-check/dist/index.js",
  format: "cjs",
  sourcemap: true,
});

console.log("Built github-actions/comply-check/dist/index.js");
