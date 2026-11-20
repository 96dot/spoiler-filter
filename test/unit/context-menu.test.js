import { test } from "node:test";
import assert from "node:assert/strict";
import {
  registerContextMenu,
  REVEAL_PAGE_MENU,
} from "../../src/context-menu.js";

function setup() {
  const state = { menus: [], messages: [] };
  const ext = {
    runtime: {
      onInstalled: {
        addListener: (fn) => {
          state.install = fn;
        },
      },
    },
    contextMenus: {
      removeAll: async () => {
        state.menus = [];
      },
      create: (menu) => {
        state.menus.push(menu);
      },
      onClicked: {
        addListener: (fn) => {
          state.click = fn;
        },
      },
    },
    i18n: { getMessage: () => "Reveal all on this page temporarily" },
    tabs: {
      sendMessage: async (...args) => {
        state.messages.push(args);
      },
    },
  };
  registerContextMenu(ext);
  return { ext, state };
}

test("install and update register a single localized page context-menu action", async () => {
  const { state } = setup();
  await state.install({ reason: "install" });
  await state.install({ reason: "update" });
  assert.equal(state.menus.length, 1);
  assert.deepEqual(state.menus[0], {
    id: REVEAL_PAGE_MENU,
    title: "Reveal all on this page temporarily",
    contexts: ["all"],
    documentUrlPatterns: ["http://*/*", "https://*/*"],
  });
});

test("a menu click reveals all frames of the selected top-level page rather than a link target", async () => {
  const { state } = setup();
  await state.click(
    {
      menuItemId: REVEAL_PAGE_MENU,
      frameId: 7,
      frameUrl: "https://embedded.example/frame",
      linkUrl: "https://other.example/target",
    },
    { id: 42, url: "https://example.com/current" },
  );
  assert.deepEqual(state.messages, [
    [42, { type: "reveal-page", url: "https://example.com/current" }],
  ]);
});

test("unrelated menus, unsupported pages and tabs without content scripts are harmless", async () => {
  const { ext, state } = setup();
  await state.click(
    { menuItemId: "other" },
    { id: 1, url: "https://example.com/" },
  );
  await state.click({ menuItemId: REVEAL_PAGE_MENU }, undefined);
  await state.click(
    { menuItemId: REVEAL_PAGE_MENU },
    { id: 1, url: "brave://extensions" },
  );
  assert.deepEqual(state.messages, []);
  ext.tabs.sendMessage = async () => {
    throw new Error("No receiving content script");
  };
  await assert.doesNotReject(async () =>
    state.click(
      { menuItemId: REVEAL_PAGE_MENU },
      { id: 1, url: "https://example.com/" },
    ),
  );
});
