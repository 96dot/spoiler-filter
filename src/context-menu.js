export const REVEAL_PAGE_MENU = "reveal-page-temporarily";

export function registerContextMenu(ext) {
  ext.runtime.onInstalled.addListener(async () => {
    await ext.contextMenus.removeAll();
    ext.contextMenus.create({
      id: REVEAL_PAGE_MENU,
      title: ext.i18n.getMessage("revealPageTemporarily"),
      contexts: ["all"],
      documentUrlPatterns: ["http://*/*", "https://*/*"],
    });
  });

  ext.contextMenus.onClicked.addListener((info, tab) => {
    if (
      info.menuItemId !== REVEAL_PAGE_MENU ||
      tab?.id === undefined ||
      !/^https?:\/\//u.test(tab.url ?? "")
    ) {
      return;
    }
    // Broadcast to every frame, using the top-level page rather than a link
    // target or the embedded frame where the user opened the menu.
    return ext.tabs
      .sendMessage(tab.id, { type: "reveal-page", url: tab.url })
      .catch(() => {});
  });
}
