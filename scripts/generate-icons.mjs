import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svg = readFileSync(join(root, "icons", "icon.svg"));

for (const size of [16, 48, 128]) {
  await sharp(svg).resize(size, size).png().toFile(join(root, "icons", `icon-${size}.png`));
}
console.log("Icons generated: 16, 48, 128px");
