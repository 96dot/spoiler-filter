export const SHORT_PLAYER = "ytd-reel-video-renderer";
export const isYoutube = (host) => /(^|\.)youtube\.com$/.test(host);

// Shorts reuse players and channel links. A reveal belongs to the video, not
// its DOM node or the channel that posted it.
export function shortKey(unit) {
  if (!unit.matches(SHORT_PLAYER)) return null;
  const id =
    unit.getAttribute("video-id") || unit.getAttribute("data-video-id");
  if (id) return `short ${id}`;
  for (const link of unit.querySelectorAll("a[href]")) {
    if (!link.getAttribute("href").includes("/shorts/")) continue;
    try {
      const url = new URL(link.href);
      const match =
        isYoutube(url.hostname) && url.pathname.match(/^\/shorts\/([^/]+)/);
      if (match) return `short ${match[1]}`;
    } catch {}
  }
  const video = unit.querySelector("video");
  const media = video?.poster || video?.getAttribute("src");
  if (media) return `short media ${media}`;
  return `short text ${unit.textContent.replace(/\s+/g, " ").trim().slice(0, 300)}`;
}

export function createShortsAudio(host) {
  const tracked = new Map();
  const protectedVideo = (video) =>
    video.isConnected &&
    video.closest(SHORT_PLAYER) &&
    video.closest('[data-novice="blur"],[data-novice="hide"]');

  function release(video, previous) {
    tracked.delete(video);
    video.removeEventListener("volumechange", previous.guard);
    video.removeEventListener("play", previous.guard);
    video.removeEventListener("loadedmetadata", previous.guard);
    video.muted = previous.muted;
  }

  return {
    sync() {
      if (!isYoutube(host)) return;
      for (const [video, previous] of tracked) {
        if (!protectedVideo(video)) release(video, previous);
      }
      for (const video of document.querySelectorAll(`${SHORT_PLAYER} video`)) {
        if (!protectedVideo(video)) continue;
        if (!tracked.has(video)) {
          const previous = {
            muted: video.muted,
            guard() {
              if (!protectedVideo(video)) return release(video, previous);
              if (!video.muted) video.muted = true;
            },
          };
          tracked.set(video, previous);
          video.addEventListener("volumechange", previous.guard);
          video.addEventListener("play", previous.guard);
          video.addEventListener("loadedmetadata", previous.guard);
        }
        if (!video.muted) video.muted = true;
      }
    },
  };
}
