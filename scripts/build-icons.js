import sharp from "sharp";
import { mkdirSync } from "node:fs";

// Modified by 96dot on 2026-11-19: generate the fork's independently drawn icon.
// The upstream NoVice logo and store graphics are not used by this generator.
const LOGO_FILE = "src/assets/logo.svg";
mkdirSync("public/icons", { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await sharp(LOGO_FILE, { density: 600 })
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon${size}.png`);
}
console.log("Spoiler Filter icons generated.");
