export const MAX_KEYWORD_LENGTH = 60;

const keywordKey = (keyword) => keyword.normalize("NFC").toLocaleLowerCase();

export const sameKeyword = (a, b) => keywordKey(a) === keywordKey(b);

export function mergeKeywords(existing, text) {
  const keywords = [...existing];
  const seen = new Set(existing.map(keywordKey));
  let added = 0;
  let skipped = 0;
  for (const entry of text.split(/[,\r\n]+/u)) {
    const keyword = entry.trim().replace(/\s+/gu, " ");
    if (!keyword) continue;
    if (keyword.length > MAX_KEYWORD_LENGTH || seen.has(keywordKey(keyword))) {
      skipped++;
      continue;
    }
    keywords.push(keyword);
    seen.add(keywordKey(keyword));
    added++;
  }
  return { keywords, added, skipped };
}
