export const COOKIE_CONSENT_STORAGE_KEY = "naashpati-cookie-consent";
export const COOKIE_CONSENT_COOKIE_NAME = "naashpati_cookie_consent";
export const COOKIE_CONSENT_POLICY_VERSION = "2026-11-22";
export const COOKIE_CONSENT_EXPIRY_DAYS = 180;

export const COOKIE_CATEGORIES = {
  essential: "essential",
  functional: "functional",
  analytics: "analytics",
  marketing: "marketing",
};

const OPTIONAL_COOKIE_PATTERNS = {
  functional: ["ajs_", "intercom-", "hubspot"],
  analytics: ["_ga", "_gid", "_gat", "_gcl_", "_hj", "_clck", "_clsk"],
  marketing: ["_fbp", "_fbc", "fr", "IDE", "NID", "ttclid"],
};

const CONSENT_CHANGE_EVENT = "naashpati:cookie-consent-changed";

const nowIso = () => new Date().toISOString();

const buildChoiceState = (overrides = {}) => ({
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
  ...overrides,
});

const pickBoolean = (value, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

export const normalizeConsentRecord = (input = {}) => {
  const choices = buildChoiceState({
    essential: true,
    functional: pickBoolean(input?.choices?.functional, false),
    analytics: pickBoolean(input?.choices?.analytics, false),
    marketing: pickBoolean(input?.choices?.marketing, false),
  });

  return {
    policyVersion: String(
      input?.policyVersion || COOKIE_CONSENT_POLICY_VERSION,
    ),
    timestamp: String(input?.timestamp || nowIso()),
    choices,
  };
};

export const isConsentRecordValid = (input) => {
  if (!input || typeof input !== "object") {
    return false;
  }

  const policyVersion = String(input.policyVersion || "").trim();
  const timestamp = String(input.timestamp || "").trim();
  const parsedTime = Date.parse(timestamp);

  if (!policyVersion || Number.isNaN(parsedTime)) {
    return false;
  }

  if (policyVersion !== COOKIE_CONSENT_POLICY_VERSION) {
    return false;
  }

  const ageMs = Date.now() - parsedTime;
  const maxAgeMs = COOKIE_CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  if (ageMs < 0 || ageMs > maxAgeMs) {
    return false;
  }

  return true;
};

const getCookieValue = (name) => {
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const part of parts) {
    if (part.startsWith(encodedName)) {
      return decodeURIComponent(part.slice(encodedName.length));
    }
  }
  return "";
};

const writeConsentCookie = (record) => {
  const payload = JSON.stringify({
    policyVersion: record.policyVersion,
    timestamp: record.timestamp,
    choices: record.choices,
  });

  const maxAge = COOKIE_CONSENT_EXPIRY_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(COOKIE_CONSENT_COOKIE_NAME)}=${encodeURIComponent(payload)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
};

const parseConsentJson = (rawValue = "") => {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

export const getStoredConsent = () => {
  const localRaw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  const localParsed = parseConsentJson(localRaw);

  if (isConsentRecordValid(localParsed)) {
    return normalizeConsentRecord(localParsed);
  }

  const cookieRaw = getCookieValue(COOKIE_CONSENT_COOKIE_NAME);
  const cookieParsed = parseConsentJson(cookieRaw);

  if (isConsentRecordValid(cookieParsed)) {
    return normalizeConsentRecord(cookieParsed);
  }

  return null;
};

export const saveConsent = (recordInput) => {
  const normalized = normalizeConsentRecord({
    ...recordInput,
    policyVersion: COOKIE_CONSENT_POLICY_VERSION,
    timestamp: nowIso(),
  });

  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify(normalized),
  );
  writeConsentCookie(normalized);
  return normalized;
};

export const clearStoredConsent = () => {
  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(COOKIE_CONSENT_COOKIE_NAME)}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
};

const removeCookie = (name) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const host = window.location.hostname;
  const domainVariants = [
    "",
    `; Domain=${host}`,
    host.includes(".") ? `; Domain=.${host}` : "",
  ].filter(Boolean);

  const pathVariants = ["/", "/api", "/checkout"];

  for (const domainSuffix of ["", ...domainVariants]) {
    for (const path of pathVariants) {
      document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=${path}; SameSite=Lax${secure}${domainSuffix}`;
    }
  }
};

const listCookieNames = () =>
  (document.cookie || "")
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter(Boolean)
    .map((name) => decodeURIComponent(name));

const removeCookiesByPatterns = (patterns = []) => {
  if (!patterns.length) {
    return;
  }

  const cookieNames = listCookieNames();
  cookieNames.forEach((name) => {
    const normalized = name.toLowerCase();
    const shouldRemove = patterns.some((pattern) =>
      normalized.startsWith(String(pattern).toLowerCase()),
    );

    if (shouldRemove) {
      removeCookie(name);
    }
  });
};

export const removeOptionalCookiesForConsent = (choices) => {
  if (!choices?.functional) {
    removeCookiesByPatterns(OPTIONAL_COOKIE_PATTERNS.functional);
  }

  if (!choices?.analytics) {
    removeCookiesByPatterns(OPTIONAL_COOKIE_PATTERNS.analytics);
  }

  if (!choices?.marketing) {
    removeCookiesByPatterns(OPTIONAL_COOKIE_PATTERNS.marketing);
  }
};

export const applyConsentGlobals = (record) => {
  const normalized = normalizeConsentRecord(record || {});

  window.__naashpatiCookieConsent = {
    ...normalized,
    hasConsent: (category) => {
      if (category === COOKIE_CATEGORIES.essential) {
        return true;
      }

      return Boolean(normalized.choices?.[category]);
    },
  };

  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGE_EVENT, {
      detail: {
        ...normalized,
      },
    }),
  );

  return normalized;
};

export const onConsentChange = (callback) => {
  const handler = (event) => {
    callback(event.detail);
  };

  window.addEventListener(CONSENT_CHANGE_EVENT, handler);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
};

export const canUseCookieCategory = (category) => {
  if (category === COOKIE_CATEGORIES.essential) {
    return true;
  }

  return Boolean(window.__naashpatiCookieConsent?.choices?.[category]);
};

export const loadScriptWithConsent = ({
  id,
  src,
  category = COOKIE_CATEGORIES.analytics,
  attributes = {},
}) => {
  if (!src || !canUseCookieCategory(category)) {
    return false;
  }

  if (id && document.getElementById(id)) {
    return true;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = true;

  if (id) {
    script.id = id;
  }

  Object.entries(attributes || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    script.setAttribute(key, String(value));
  });

  document.head.appendChild(script);
  return true;
};

export const COOKIE_PREFERENCE_OPEN_EVENT = "naashpati:open-cookie-preferences";
