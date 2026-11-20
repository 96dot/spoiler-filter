import {
  compileKeywords,
  findSpoiler,
  findUrlSpoiler,
  isNovicePage,
} from "../spoilers.js";
import {
  DEFAULT_SETTINGS,
  blocksOn,
  ext,
  getSettings,
  onSettingsChange,
} from "../settings.js";
import { findSubjects } from "../sites.js";
import { WATCHED_ATTRS, createBlocker, termLabel } from "./blocker.js";
import { createReveals } from "./reveals.js";
import { BLOCKED_TITLE, createShield } from "./shield.js";

const host = location.hostname;
const isTopFrame = window === window.top;
const reveals = createReveals();
const blocker = createBlocker(host, reveals);

let settings = DEFAULT_SETTINGS;
let topUrl = location.href;
let topUrlKnown = isTopFrame;
let keywords = null;
const siteTitles = new Map();
let lastHref = location.href;
let lastSubjects = "";
let lastReported = -1;
let appliedConfig = "off";

const shield = createShield({
  onLeave: () => {
    if (history.length > 1) history.back();
    else ext.runtime.sendMessage({ type: "close-tab" });
  },
  onReveal: () => {
    reveals.addPage(location.href);
    sync();
  },
});

function isActive() {
  return (
    blocksOn(settings, location.href) &&
    (isTopFrame || blocksOn(settings, topUrl)) &&
    !reveals.hasPage(location.href)
  );
}

const rules = () => ({ nameAllowed: isNovicePage(location.href) });

function pageMatches() {
  const page = rules();
  return [
    findUrlSpoiler(location.href, keywords, page),
    findSpoiler(siteTitle(), keywords, page),
    ...findSubjects(host).flatMap((subject) => [
      findSpoiler(subject.textContent, keywords, page),
      subject.href ? findUrlSpoiler(subject.href, keywords, page) : null,
    ]),
  ].filter(Boolean);
}

const pageSpoiler = () =>
  pageMatches().find((match) => match.level === "gta6") ?? null;
const isAboutGta = () => pageMatches().length > 0;

const subjectsText = () =>
  findSubjects(host)
    .map((subject) => `${subject.textContent} ${subject.href ?? ""}`)
    .join("\n");

// Titles are kept per URL, so a site that keeps its title on Back cannot lend
// this page the title of the page it left.
const siteTitle = () => siteTitles.get(location.href) ?? "";

function readSiteTitle() {
  if (document.title !== BLOCKED_TITLE) {
    siteTitles.set(location.href, document.title);
  }
}

function restoreTitle() {
  if (document.title === BLOCKED_TITLE) document.title = siteTitle();
}

function count() {
  return blocker.count() + (shield.shown ? 1 : 0);
}

function report() {
  if (!isTopFrame) return;
  const current = count();
  if (current === lastReported) return;
  lastReported = current;
  ext.runtime
    .sendMessage({ type: "blocked-count", count: current })
    .catch(() => {});
}

function sync() {
  readSiteTitle();
  const active = isActive();
  const aboutGta = active && isAboutGta();
  const { nameAllowed } = rules();
  const config = active
    ? `on:${settings.strict}:${settings.style}:${aboutGta}:${nameAllowed}:${settings.keywords.join("\n")}`
    : "off";
  if (config !== appliedConfig) {
    appliedConfig = config;
    blocker.clearAll();
    blocker.configure(settings, { aboutGta, nameAllowed });
    if (active) blocker.scan(document.documentElement);
  }
  const spoiler = active ? pageSpoiler() : null;
  if (spoiler) {
    shield.show(termLabel(spoiler.term));
  } else {
    shield.hide();
    restoreTitle();
  }
  blocker.syncMedia();
  report();
}

function handleMutations(records) {
  if (appliedConfig !== "off") {
    blocker.recheckShorts(records);
    for (const record of records) {
      if (record.type === "attributes") blocker.checkAttributes(record.target);
      else if (record.type === "characterData") blocker.scan(record.target);
      else record.addedNodes.forEach((node) => blocker.scan(node));
    }
  }
  blocker.syncMedia();
  const titleChanged =
    document.title !== BLOCKED_TITLE && document.title !== siteTitle();
  const subjects = subjectsText();
  if (
    titleChanged ||
    location.href !== lastHref ||
    subjects !== lastSubjects ||
    shield.shown
  ) {
    lastHref = location.href;
    lastSubjects = subjects;
    sync();
  } else {
    report();
  }
}

function revealOnActivate(event) {
  if (!event.isTrusted) return;
  const unit = blocker.blurredUnitAt(event.target);
  if (!unit) return;
  if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.type === "click" || event.type === "keydown") {
    blocker.reveal(unit);
    report();
  }
}

const GUARDED_EVENTS = [
  "pointerdown",
  "mousedown",
  "mouseup",
  "click",
  "auxclick",
  "keydown",
];

function start() {
  new MutationObserver(handleMutations).observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: WATCHED_ATTRS,
  });

  window.addEventListener("popstate", () => handleMutations([]));

  for (const type of GUARDED_EVENTS) {
    window.addEventListener(type, revealOnActivate, true);
  }

  document.addEventListener(
    "play",
    (event) => {
      if (shield.shown) event.target.pause();
    },
    true,
  );

  sync();
  const apply = (next) => {
    settings = next;
    keywords = compileKeywords(next.keywords);
    sync();
  };
  Promise.all([
    getSettings(),
    isTopFrame
      ? Promise.resolve(location.href)
      : ext.runtime.sendMessage({ type: "page-url" }).catch(() => null),
  ]).then(([next, siteUrl]) => {
    if (!topUrlKnown) topUrl = siteUrl || location.href;
    apply(next);
  });
  onSettingsChange(apply);

  ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "page-url-changed") {
      topUrl = message.url;
      topUrlKnown = true;
      sync();
    } else if (message.type === "status" && isTopFrame) {
      sendResponse({
        host,
        url: location.href,
        count: count(),
        shielded: shield.shown,
      });
    }
  });
}

if (!window.__novice) {
  window.__novice = true;
  start();
}
