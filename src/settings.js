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
  const domain = normalizeDomain(host);
  if (domain) await setExclusionAllowed(domain, allowed);
}

export async function setExclusionAllowed(input, allowed) {
  const exclusion = normalizeExclusion(input);
  if (!exclusion) return;
  const { allowedSites } = await getSettings();
  const others = allowedSites.filter(
    (site) => normalizeExclusion(site) !== exclusion,
  );
  await updateSettings({
    allowedSites: allowed ? [...others, exclusion] : others,
  });
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

export function isSiteAllowed(settings, address) {
  return allowedExclusionFor(settings, address) !== null;
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

export function normalizePageUrl(input) {
  const value = input.trim();
  if (!/^https?:\/\//iu.test(value)) return null;
  const host = normalizeDomain(value);
  if (!host) return null;
  const url = new URL(value);
  url.hostname = host;
  return url.href;
}

// Bare hostnames cover a domain; addresses with a scheme or path stay exact.
export function normalizeExclusion(input) {
  const value = input.trim();
  if (value.includes("://")) return normalizePageUrl(value);
  if (/[/?#]/u.test(value)) return normalizePageUrl(`https://${value}`);
  return normalizeDomain(value);
}

export function allowedDomainFor(settings, host) {
  const normalized = normalizeDomain(host);
  if (!normalized) return null;
  let match = null;
  let shortest = Infinity;
  for (const site of settings.allowedSites) {
    const domain = normalizeExclusion(site);
    if (
      domain &&
      !domain.includes("://") &&
      domain.length < shortest &&
      (normalized === domain || normalized.endsWith(`.${domain}`))
    ) {
      match = site;
      shortest = domain.length;
    }
  }
  return match;
}

export function allowedExclusionFor(settings, address) {
  const domain = allowedDomainFor(settings, address);
  if (domain) return domain;
  const url = normalizePageUrl(address);
  if (!url) return null;
  return (
    settings.allowedSites.find((site) => normalizeExclusion(site) === url) ??
    null
  );
}

export function blocksOn(settings, address) {
  return settings.enabled && !isSiteAllowed(settings, address);
}
