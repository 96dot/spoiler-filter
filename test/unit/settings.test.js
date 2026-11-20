import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  allowedDomainFor,
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
