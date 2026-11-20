import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeKeywords } from "../../src/keywords.js";

test("imports comma and newline lists, preserves phrases and existing keywords", () => {
  const existing = ["Saved word"];
  assert.deepEqual(
    mergeKeywords(
      existing,
      "\uFEFFcarbonara, actor   interview\r\nnew\tgame\rrelease\n\n, ",
    ),
    {
      keywords: [
        "Saved word",
        "carbonara",
        "actor interview",
        "new game",
        "release",
      ],
      added: 4,
      skipped: 0,
    },
  );
  assert.deepEqual(existing, ["Saved word"]);
});

test("skips case and Unicode duplicates without conflating accents", () => {
  assert.deepEqual(mergeKeywords(["Café"], "CAFÉ,cafe\u0301,cafe,NEWS,news"), {
    keywords: ["Café", "cafe", "NEWS"],
    added: 2,
    skipped: 3,
  });
});

test("skips overlong entries, reports skipped counts, and keeps valid entries", () => {
  const limit = "x".repeat(60);
  assert.deepEqual(mergeKeywords([], `${limit},${limit}x,short`), {
    keywords: [limit, "short"],
    added: 2,
    skipped: 1,
  });
  assert.deepEqual(mergeKeywords(["saved"], " , \n\r\n"), {
    keywords: ["saved"],
    added: 0,
    skipped: 0,
  });
});
