import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  allowedDomainFor,
  allowedExclusionFor,
  normalizeExclusion,
  normalizePageUrl,
  blocksOn,
  isSiteAllowed,
  normalizeDomain,
} from "../../src/settings.js";

const settings = { ...DEFAULT_SETTINGS, allowedSites: ["example.com"] };

test("canonicalizes domains and HTTP(S) URLs", () => {
  for (const input of [
    "EXAMPLE.com",
    " example.com. ",
    "https://Example.com:443/path?query=yes#anchor",
    "example.com/path",
    "http://example.com:8080",
  ]) {
    assert.equal(normalizeDomain(input), "example.com", input);
  }
  assert.equal(normalizeDomain("https://bücher.de"), "xn--bcher-kva.de");
  assert.equal(normalizeDomain("http://127.0.0.1:8080"), "127.0.0.1");
  assert.equal(normalizeDomain("localhost:8080"), "localhost");
  assert.equal(normalizeDomain("http://[::1]:8080"), "[::1]");
});

test("rejects invalid domains, credentials, wildcards, and non-web URLs", () => {
  for (const input of [
    "",
    "not a domain",
    "https://",
    "*.example.com",
    "-bad.com",
    "example..com",
    "https://user:password@example.com",
    "https://example.com@evil.com",
    "ftp://example.com",
    "javascript:alert(1)",
    "https://example.com\\evil",
    `${"a".repeat(64)}.com`,
  ]) {
    assert.equal(normalizeDomain(input), null, input);
  }
});

test("excludes exact domains and subdomains using hostname boundaries", () => {
  for (const host of [
    "example.com",
    "www.example.com",
    "deep.news.example.com",
    "EXAMPLE.COM.",
  ]) {
    assert.equal(isSiteAllowed(settings, host), true, host);
    assert.equal(blocksOn(settings, host), false, host);
  }
  for (const host of ["notexample.com", "example.com.evil.test", "other.com"]) {
    assert.equal(isSiteAllowed(settings, host), false, host);
    assert.equal(blocksOn(settings, host), true, host);
  }
  assert.equal(blocksOn({ ...settings, enabled: false }, "other.com"), false);
});

test("a subdomain exclusion does not exclude its parent or siblings", () => {
  const scoped = { ...settings, allowedSites: ["news.example.com"] };
  assert.equal(isSiteAllowed(scoped, "news.example.com"), true);
  assert.equal(isSiteAllowed(scoped, "deep.news.example.com"), true);
  assert.equal(isSiteAllowed(scoped, "example.com"), false);
  assert.equal(isSiteAllowed(scoped, "www.example.com"), false);
});

test("preserves existing saved exclusions and identifies the broadest matching domain", () => {
  assert.equal(
    isSiteAllowed({ ...settings, allowedSites: ["127.0.0.1"] }, "127.0.0.1"),
    true,
  );
  assert.equal(
    allowedDomainFor(
      { ...settings, allowedSites: ["www.example.com", "example.com"] },
      "www.example.com",
    ),
    "example.com",
  );
  assert.equal(allowedDomainFor(settings, "other.com"), null);
  assert.equal(allowedDomainFor(settings, ""), null);
});

test("distinguishes domain exclusions from exact addresses without discarding paths", () => {
  assert.equal(normalizeExclusion(" Reddit.COM. "), "reddit.com");
  assert.equal(normalizeExclusion("https://Reddit.COM"), "https://reddit.com/");
  assert.equal(
    normalizeExclusion(
      "https://WWW.Reddit.com:443/user/ExampleProfile/?sort=new#posts",
    ),
    "https://www.reddit.com/user/ExampleProfile/?sort=new#posts",
  );
  assert.equal(
    normalizeExclusion("www.reddit.com/user/ExampleProfile/"),
    "https://www.reddit.com/user/ExampleProfile/",
  );
  assert.equal(
    normalizePageUrl("https://example.com:8443/SomePath?a=1&b=2#Post"),
    "https://example.com:8443/SomePath?a=1&b=2#Post",
  );
  for (const input of [
    "not a domain",
    "https://",
    "ftp://example.com/path",
    "https://user:pass@example.com/path",
    "https://example.com\\path",
  ]) {
    assert.equal(normalizeExclusion(input), null, input);
  }
});

test("an exact profile URL leaves Reddit's other pages, subdomains and paths filtered", () => {
  const profile = "https://www.reddit.com/user/ExampleProfile/";
  const exact = { ...DEFAULT_SETTINGS, allowedSites: [profile] };
  assert.equal(isSiteAllowed(exact, profile), true);
  assert.equal(
    isSiteAllowed(exact, "https://WWW.REDDIT.COM:443/user/ExampleProfile/"),
    true,
  );
  assert.equal(allowedExclusionFor(exact, profile), profile);
  assert.equal(
    allowedDomainFor(exact, profile),
    null,
    "URLs must never widen into domain exclusions",
  );
  for (const url of [
    "https://www.reddit.com/",
    "https://www.reddit.com/r/example/",
    "https://www.reddit.com/user/OtherProfile/",
    `${profile}comments/`,
    "https://old.reddit.com/user/ExampleProfile/",
    "http://www.reddit.com/user/ExampleProfile/",
    "https://www.reddit.com/user/exampleprofile/",
    "https://www.reddit.com/user/ExampleProfile",
    `${profile}?sort=new`,
    `${profile}#posts`,
    "www.reddit.com",
  ]) {
    assert.equal(blocksOn(exact, url), true, url);
  }
});

test("exact URLs preserve queries, fragments, ports and path boundaries", () => {
  const url = "https://example.com:8443/feed?view=all#post";
  const exact = { ...DEFAULT_SETTINGS, allowedSites: [url] };
  assert.equal(blocksOn(exact, url), false);
  for (const address of [
    "https://example.com:8443/feed?view=other#post",
    "https://example.com:8443/feed?view=all#other",
    "https://example.com:8443/feed?view=all",
    "https://example.com/feed?view=all#post",
    `${url}script`,
  ]) {
    assert.equal(blocksOn(exact, address), true, address);
  }
  assert.equal(
    blocksOn(
      { ...exact, allowedSites: ["https://example.com/"] },
      "https://example.com/path",
    ),
    true,
  );
});

test("domain and exact-URL rules coexist and can be removed independently", () => {
  const page = "https://news.example.com/page";
  const mixed = { ...DEFAULT_SETTINGS, allowedSites: ["example.com", page] };
  assert.equal(allowedExclusionFor(mixed, page), "example.com");
  assert.equal(blocksOn(mixed, "https://other.example.com/another"), false);
  const onlyPage = { ...mixed, allowedSites: [page] };
  assert.equal(allowedExclusionFor(onlyPage, page), page);
  assert.equal(blocksOn(onlyPage, "https://other.example.com/another"), true);
  assert.equal(
    blocksOn({ ...mixed, allowedSites: ["example.com"] }, page),
    false,
  );
});
