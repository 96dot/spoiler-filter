import logo from "../assets/logo.svg";
import { mergeKeywords, sameKeyword } from "../keywords.js";
import {
  allowedDomainFor,
  ext,
  getSettings,
  isSiteAllowed,
  normalizeDomain,
  onSettingsChange,
  setSiteAllowed,
  updateSettings,
} from "../settings.js";

const $ = (id) => document.getElementById(id);
const t = (key, substitutions) => ext.i18n.getMessage(key, substitutions);
const MAX_IMPORT_BYTES = 1024 * 1024;

function translate() {
  document.documentElement.lang = ext.i18n.getUILanguage();
  document.documentElement.dir = t("@@bidi_dir");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  $("logo").innerHTML = logo;
  $("version").textContent = `v${ext.runtime.getManifest().version}`;
  $("keyword-input").placeholder = t("keywordPlaceholder");
}

function renderKeywords(settings) {
  const list = $("keyword-list");
  list.replaceChildren(
    ...settings.keywords.map((keyword) => {
      const item = document.createElement("li");
      const text = document.createElement("span");
      const remove = document.createElement("button");
      text.textContent = keyword;
      remove.type = "button";
      remove.textContent = "×";
      remove.title = t("keywordRemove");
      remove.setAttribute("aria-label", `${t("keywordRemove")}: ${keyword}`);
      remove.disabled = !settings.enabled;
      remove.addEventListener("click", () =>
        updateSettings({
          keywords: settings.keywords.filter((k) => k !== keyword),
        }),
      );
      item.append(text, remove);
      return item;
    }),
  );
  list.hidden = settings.keywords.length === 0;
  $("keyword-input").disabled = !settings.enabled;
  $("keyword-add").disabled = !settings.enabled;
  ["import-input", "import-file", "import-add"].forEach((id) => {
    $(id).disabled = !settings.enabled;
  });
}

function renderDomains(settings) {
  const list = $("domain-list");
  list.replaceChildren(
    ...settings.allowedSites.map((domain) => {
      const item = document.createElement("li");
      const text = document.createElement("span");
      const remove = document.createElement("button");
      text.textContent = domain;
      remove.type = "button";
      remove.textContent = "×";
      remove.title = t("keywordRemove");
      remove.setAttribute("aria-label", `${t("keywordRemove")}: ${domain}`);
      remove.disabled = !settings.enabled;
      remove.addEventListener("click", async () => {
        const current = await getSettings();
        await updateSettings({
          allowedSites: current.allowedSites.filter((site) => site !== domain),
        });
      });
      item.append(text, remove);
      return item;
    }),
  );
  list.hidden = settings.allowedSites.length === 0;
  $("domain-input").disabled = !settings.enabled;
  $("domain-add").disabled = !settings.enabled;
}

async function pageStatus() {
  const [tab] = await ext.tabs.query({ active: true, currentWindow: true });
  try {
    return await ext.tabs.sendMessage(tab.id, { type: "status" });
  } catch {
    return null;
  }
}

function render(settings, status) {
  document.body.classList.toggle("paused", !settings.enabled);
  $("enabled").checked = settings.enabled;
  $("enabled-hint").textContent = t(
    settings.enabled ? "protectionOn" : "protectionOff",
  );
  $("strict").checked = settings.strict;
  $("strict").disabled = !settings.enabled;
  document.querySelectorAll('input[name="style"]').forEach((radio) => {
    radio.checked = radio.value === settings.style;
    radio.disabled = !settings.enabled;
  });
  renderKeywords(settings);
  renderDomains(settings);

  $("site-row").hidden = !status;
  if (!status) {
    $("count").textContent = "0";
    $("count-label").textContent = t("countLabelNone");
    return;
  }

  const siteBlocked = !isSiteAllowed(settings, status.host);
  const inherited =
    !siteBlocked && allowedDomainFor(settings, status.host) !== status.host;
  $("site").checked = siteBlocked;
  $("site").disabled = !settings.enabled || inherited;
  $("site-host").textContent = inherited
    ? t("siteExcludedBy", [allowedDomainFor(settings, status.host)])
    : siteBlocked
      ? status.host
      : t("siteAllowed");
  $("count").textContent = status.count;
  $("count-label").textContent = t(
    status.shielded ? "countLabelPage" : "countLabel",
  );
}

async function init() {
  translate();
  let settings = await getSettings();
  let status = await pageStatus();
  render(settings, status);

  $("enabled").addEventListener("change", (e) =>
    updateSettings({ enabled: e.target.checked }),
  );
  $("strict").addEventListener("change", (e) =>
    updateSettings({ strict: e.target.checked }),
  );
  $("style").addEventListener("change", (e) =>
    updateSettings({ style: e.target.value }),
  );
  $("site").addEventListener("change", (e) => {
    if (status) setSiteAllowed(status.host, !e.target.checked);
  });
  $("keyword-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const keyword = $("keyword-input").value.trim().replace(/\s+/g, " ");
    $("keyword-input").value = "";
    const current = await getSettings();
    if (!keyword || current.keywords.some((k) => sameKeyword(k, keyword))) {
      return;
    }
    await updateSettings({ keywords: [...current.keywords, keyword] });
  });

  $("import-file").addEventListener("change", async (e) => {
    const [file] = e.target.files;
    if (!file) return;
    $("import-status").textContent = "";
    try {
      if (file.size > MAX_IMPORT_BYTES) {
        $("import-status").textContent = t("importTooLarge");
        return;
      }
      $("import-input").value = await file.text();
    } catch {
      $("import-status").textContent = t("importError");
    } finally {
      e.target.value = "";
    }
  });

  $("import-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $("import-input").value;
    if (new Blob([text]).size > MAX_IMPORT_BYTES) {
      $("import-status").textContent = t("importTooLarge");
      return;
    }
    $("import-add").disabled = true;
    try {
      const current = await getSettings();
      const { keywords, added, skipped } = mergeKeywords(
        current.keywords,
        text,
      );
      if (added) await updateSettings({ keywords });
      $("import-status").textContent = t("importResult", [
        String(added),
        String(skipped),
      ]);
      $("import-input").value = "";
    } catch {
      $("import-status").textContent = t("importError");
    } finally {
      $("import-add").disabled = !settings.enabled;
    }
  });

  $("domain-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const domain = normalizeDomain($("domain-input").value);
    if (!domain) {
      $("domain-status").textContent = t("domainInvalid");
      return;
    }
    try {
      await setSiteAllowed(domain, true);
      $("domain-input").value = "";
      $("domain-status").textContent = "";
    } catch {
      $("domain-status").textContent = t("saveError");
    }
  });

  $("domain-input").addEventListener("input", () => {
    $("domain-status").textContent = "";
  });

  onSettingsChange(async (next) => {
    settings = next;
    status = (await pageStatus()) ?? status;
    render(settings, status);
  });
}

init();
