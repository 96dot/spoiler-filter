import { shortKey } from "./shorts.js";

const STORE = "novice:revealed";
const LIMIT = 1000;
const MAX_TEXT_KEY = 300;

function load() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(STORE)) ?? []);
  } catch {
    return new Set();
  }
}

// A unit the user chose to see stays shown for the rest of the tab's session,
// even after the site renders it again or the tab loads a new page.
export function createReveals() {
  const keys = load();

  function remember(key) {
    keys.delete(key);
    keys.add(key);
    if (keys.size > LIMIT) keys.delete(keys.values().next().value);
    try {
      sessionStorage.setItem(STORE, JSON.stringify([...keys]));
    } catch {}
  }

  return {
    hasUnit: (unit) => keys.has(unitKey(unit)),
    addUnit: (unit) => remember(unitKey(unit)),
  };
}

// A card's links name it better than its text, which holds counts and times
// that change between renders.
function unitKey(unit) {
  const short = shortKey(unit);
  if (short) return short;
  const anchors = [unit, ...unit.querySelectorAll("a[href]")].filter(
    (el) => el instanceof HTMLAnchorElement && el.href,
  );
  const links = [...new Set(anchors.map((a) => a.href.split("#")[0]))];
  if (links.length) return `unit ${links.sort().join(" ")}`;
  const text = unit.textContent.replace(/\s+/g, " ").trim();
  return `unit ${text.slice(0, MAX_TEXT_KEY)}`;
}
