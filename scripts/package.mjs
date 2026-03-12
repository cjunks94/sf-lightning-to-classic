import { execSync } from "child_process";
import { readFileSync, accessSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
const outName = `sf-lightning-to-classic-v${pkg.version}.zip`;

const files = [
  "manifest.json",
  "dist/background.js",
  "dist/popup.js",
  "src/popup.html",
  "src/popup.css",
  "icons/icon-16.png",
  "icons/icon-48.png",
  "icons/icon-128.png",
];

for (const f of files) {
  try {
    accessSync(join(root, f));
  } catch {
    console.error(`Missing: ${f} -- run "npm run build" and "npm run icons" first.`);
    process.exit(1);
  }
}

execSync(`zip -r9 "${outName}" ${files.join(" ")}`, { cwd: root, stdio: "inherit" });
console.log(`\nCreated ${outName}`);
