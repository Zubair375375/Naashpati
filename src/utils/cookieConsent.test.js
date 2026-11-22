import test from "node:test";
import assert from "node:assert/strict";
import {
  COOKIE_CATEGORIES,
  COOKIE_CONSENT_POLICY_VERSION,
  applyConsentGlobals,
  canUseCookieCategory,
  getStoredConsent,
  isConsentRecordValid,
  loadScriptWithConsent,
  normalizeConsentRecord,
  onConsentChange,
  removeOptionalCookiesForConsent,
  saveConsent,
} from "./cookieConsent.js";

class LocalStorageMock {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

const setupBrowserMocks = () => {
  const cookies = new Map();
  const scripts = [];

  const documentMock = {
    head: {
      appendChild(node) {
        scripts.push(node);
      },
    },
    createElement(tag) {
      return {
        tagName: String(tag).toUpperCase(),
        setAttribute(name, value) {
          this[name] = String(value);
        },
      };
    },
    getElementById(id) {
      return scripts.find((item) => item.id === id) || null;
    },
    get cookie() {
      return [...cookies.entries()]
        .map(
          ([name, value]) =>
            `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
        )
        .join("; ");
    },
    set cookie(value) {
      const parts = String(value)
        .split(";")
        .map((part) => part.trim());
      const [nameValue, ...attributes] = parts;
      const separatorIndex = nameValue.indexOf("=");
      const rawName =
        separatorIndex >= 0 ? nameValue.slice(0, separatorIndex) : "";
      const rawCookieValue =
        separatorIndex >= 0 ? nameValue.slice(separatorIndex + 1) : "";
      const name = decodeURIComponent(rawName || "");
      const cookieValue = decodeURIComponent(rawCookieValue || "");
      const maxAgeAttribute = attributes.find((attribute) =>
        attribute.toLowerCase().startsWith("max-age="),
      );

      if (!name) {
        return;
      }

      if (maxAgeAttribute && Number(maxAgeAttribute.split("=")[1]) <= 0) {
        cookies.delete(name);
        return;
      }

      cookies.set(name, cookieValue);
    },
  };

  const listeners = new Map();
  const windowMock = {
    location: {
      protocol: "https:",
      hostname: "naashpati.com",
    },
    localStorage: new LocalStorageMock(),
    addEventListener(type, callback) {
      const existing = listeners.get(type) || [];
      listeners.set(type, [...existing, callback]);
    },
    removeEventListener(type, callback) {
      const existing = listeners.get(type) || [];
      listeners.set(
        type,
        existing.filter((item) => item !== callback),
      );
    },
    dispatchEvent(event) {
      const existing = listeners.get(event.type) || [];
      existing.forEach((callback) => callback(event));
      return true;
    },
  };

  globalThis.document = documentMock;
  globalThis.window = windowMock;
  globalThis.CustomEvent = class {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  };

  return { cookies, scripts };
};

test("normalizeConsentRecord keeps essential true and applies defaults", () => {
  const normalized = normalizeConsentRecord({
    choices: {
      essential: false,
      analytics: true,
    },
  });

  assert.equal(normalized.policyVersion, COOKIE_CONSENT_POLICY_VERSION);
  assert.equal(normalized.choices.essential, true);
  assert.equal(normalized.choices.analytics, true);
  assert.equal(normalized.choices.functional, false);
  assert.equal(normalized.choices.marketing, false);
});

test("isConsentRecordValid rejects stale and mismatched policy records", () => {
  const oldTimestamp = new Date(
    Date.now() - 300 * 24 * 60 * 60 * 1000,
  ).toISOString();

  assert.equal(
    isConsentRecordValid({
      policyVersion: "old-version",
      timestamp: new Date().toISOString(),
      choices: { essential: true },
    }),
    false,
  );

  assert.equal(
    isConsentRecordValid({
      policyVersion: COOKIE_CONSENT_POLICY_VERSION,
      timestamp: oldTimestamp,
      choices: { essential: true },
    }),
    false,
  );
});

test("saveConsent and getStoredConsent round-trip valid consent", () => {
  setupBrowserMocks();

  const saved = saveConsent({
    choices: {
      essential: true,
      functional: true,
      analytics: false,
      marketing: true,
    },
  });

  const loaded = getStoredConsent();
  assert.equal(Boolean(loaded), true);
  assert.equal(loaded.choices.functional, true);
  assert.equal(loaded.choices.analytics, false);
  assert.equal(loaded.choices.marketing, true);
  assert.equal(saved.policyVersion, COOKIE_CONSENT_POLICY_VERSION);
});

test("applyConsentGlobals publishes consent state and helpers", () => {
  setupBrowserMocks();

  let observed = null;
  const off = onConsentChange((record) => {
    observed = record;
  });

  applyConsentGlobals({
    choices: {
      essential: true,
      functional: false,
      analytics: true,
      marketing: false,
    },
  });

  assert.equal(Boolean(observed), true);
  assert.equal(canUseCookieCategory(COOKIE_CATEGORIES.essential), true);
  assert.equal(canUseCookieCategory(COOKIE_CATEGORIES.analytics), true);
  assert.equal(canUseCookieCategory(COOKIE_CATEGORIES.marketing), false);

  off();
});

test("removeOptionalCookiesForConsent cleans optional cookies while preserving others", () => {
  const { cookies } = setupBrowserMocks();

  document.cookie = "_ga=ga-cookie-value";
  document.cookie = "_fbp=fb-cookie-value";
  document.cookie = "sessionid=required-cookie";

  assert.equal(cookies.has("_ga"), true);
  assert.equal(cookies.has("_fbp"), true);

  removeOptionalCookiesForConsent({
    essential: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  assert.equal(cookies.has("_ga"), false);
  assert.equal(cookies.has("_fbp"), false);
  assert.equal(cookies.has("sessionid"), true);
});

test("loadScriptWithConsent blocks and allows script injection by category", () => {
  const { scripts } = setupBrowserMocks();

  applyConsentGlobals({
    choices: {
      essential: true,
      functional: true,
      analytics: false,
      marketing: false,
    },
  });

  const blocked = loadScriptWithConsent({
    id: "analytics-script",
    src: "https://example.com/analytics.js",
    category: COOKIE_CATEGORIES.analytics,
  });

  assert.equal(blocked, false);
  assert.equal(scripts.length, 0);

  applyConsentGlobals({
    choices: {
      essential: true,
      functional: true,
      analytics: true,
      marketing: false,
    },
  });

  const allowed = loadScriptWithConsent({
    id: "analytics-script",
    src: "https://example.com/analytics.js",
    category: COOKIE_CATEGORIES.analytics,
    attributes: {
      "data-test": "ok",
    },
  });

  assert.equal(allowed, true);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].id, "analytics-script");
  assert.equal(scripts[0].src, "https://example.com/analytics.js");
  assert.equal(scripts[0]["data-test"], "ok");
});
