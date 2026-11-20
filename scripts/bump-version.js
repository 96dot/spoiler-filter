import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(file, "utf8"));
const parts = /^(\d+)\.(\d+)\.(\d+)$/u.exec(pkg.version);
if (!parts || Number(parts[3]) >= 65535) {
  throw new Error(
    "Set a valid three-part browser version before building an update.",
  );
}
pkg.version = `${parts[1]}.${parts[2]}.${Number(parts[3]) + 1}`;
writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`Building Spoiler Filter update v${pkg.version}`);
