export const ext = globalThis.browser ?? globalThis.chrome;

export const DEFAULT_SETTINGS = {
  enabled: true,
  strict: true,
  style: "blur",
  allowedSites: [],
  keywords: [],
};

export async function getSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...(await ext.storage.local.get(DEFAULT_SETTINGS)),
  };
}

export async function updateSettings(patch) {
  await ext.storage.local.set(patch);
}

export async function setSiteAllowed(host, allowed) {
  host = normalizeDomain(host);
  if (!host) return;
  const { allowedSites } = await getSettings();
  const others = allowedSites.filter((site) => normalizeDomain(site) !== host);
  await updateSettings({ allowedSites: allowed ? [...others, host] : others });
}

export function onSettingsChange(callback) {
  ext.storage.onChanged.addListener((changes, area) => {
    if (
      area === "local" &&
      Object.keys(changes).some((k) => k in DEFAULT_SETTINGS)
    ) {
      getSettings().then(callback);
    }
  });
}

export function isSiteAllowed(settings, host) {
  return allowedDomainFor(settings, host) !== null;
}

// Accept a hostname or HTTP(S) URL; store only the canonical hostname.
export function normalizeDomain(input) {
  const value = input.trim();
  if (!value || /[\s\\]/u.test(value)) return null;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/\.$/u, "");
    if (host.startsWith("[") && host.endsWith("]")) return host;
    if (
      host.length > 253 ||
      !host
        .split(".")
        .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(label))
    ) {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

export function allowedDomainFor(settings, host) {
  const normalized = normalizeDomain(host);
  if (!normalized) return null;
  let match = null;
  let shortest = Infinity;
  for (const site of settings.allowedSites) {
    const domain = normalizeDomain(site);
    if (
      domain &&
      domain.length < shortest &&
      (normalized === domain || normalized.endsWith(`.${domain}`))
    ) {
      match = site;
      shortest = domain.length;
    }
  }
  return match;
}

export function blocksOn(settings, host) {
  return settings.enabled && !isSiteAllowed(settings, host);
}
