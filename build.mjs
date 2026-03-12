import * as esbuild from "esbuild";

const common = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: "chrome120",
  format: "iife",
};

await Promise.all([
  esbuild.build({
    ...common,
    entryPoints: ["src/background.ts"],
    outfile: "dist/background.js",
  }),
  esbuild.build({
    ...common,
    entryPoints: ["src/popup.ts"],
    outfile: "dist/popup.js",
  }),
]);

console.log("Build complete.");
