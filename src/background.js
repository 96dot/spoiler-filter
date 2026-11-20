import { ext } from "./settings.js";

const BADGE_COLOR = "#ff3d9a";

ext.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") return;
  // Tabs opened before install never received the content script; protect them now.
  const {
    content_scripts: [script],
  } = ext.runtime.getManifest();
  const tabs = await ext.tabs.query({ url: ["http://*/*", "https://*/*"] });
  for (const tab of tabs) {
    ext.scripting
      .insertCSS({
        target: { tabId: tab.id, allFrames: true },
        files: script.css,
      })
      .then(() =>
        ext.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          files: script.js,
        }),
      )
      .catch(() => {});
  }
});

ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  if (tabId === undefined) return;

  if (message.type === "page-url") {
    sendResponse(sender.tab.url ?? null);
  } else if (message.type === "blocked-count") {
    ext.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });
    ext.action.setBadgeText({
      tabId,
      text: message.count > 0 ? String(Math.min(message.count, 999)) : "",
    });
  } else if (message.type === "close-tab") {
    ext.tabs.remove(tabId);
  }
});

// URL updates include pushState/replaceState navigation without DOM changes.
ext.tabs.onUpdated.addListener((tabId, changes) => {
  if (!changes.url) return;
  ext.tabs
    .sendMessage(tabId, { type: "page-url-changed", url: changes.url })
    .catch(() => {});
});
