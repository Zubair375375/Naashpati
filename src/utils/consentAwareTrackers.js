import {
  COOKIE_CATEGORIES,
  canUseCookieCategory,
  loadScriptWithConsent,
  onConsentChange,
} from "./cookieConsent";

const readEnv = (name) => {
  if (typeof import.meta === "undefined" || !import.meta.env) {
    return "";
  }

  return String(import.meta.env[name] || "").trim();
};

const trackerConfig = {
  ga4MeasurementId: readEnv("VITE_GA4_MEASUREMENT_ID"),
  gtmContainerId: readEnv("VITE_GTM_CONTAINER_ID"),
  metaPixelId: readEnv("VITE_META_PIXEL_ID"),
};

const ensureGa4 = () => {
  if (!trackerConfig.ga4MeasurementId) {
    return false;
  }

  const allowed = loadScriptWithConsent({
    id: "naashpati-ga4-src",
    src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(trackerConfig.ga4MeasurementId)}`,
    category: COOKIE_CATEGORIES.analytics,
  });

  if (!allowed) {
    window[`ga-disable-${trackerConfig.ga4MeasurementId}`] = true;
    return false;
  }

  window[`ga-disable-${trackerConfig.ga4MeasurementId}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", trackerConfig.ga4MeasurementId, {
    anonymize_ip: true,
  });

  return true;
};

const ensureGtm = () => {
  if (!trackerConfig.gtmContainerId) {
    return false;
  }

  const allowed = loadScriptWithConsent({
    id: "naashpati-gtm-src",
    src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(trackerConfig.gtmContainerId)}`,
    category: COOKIE_CATEGORIES.analytics,
  });

  if (!allowed) {
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  if (!window.__naashpatiGtmInit) {
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });
    window.__naashpatiGtmInit = true;
  }

  return true;
};

const ensureMetaPixel = () => {
  if (!trackerConfig.metaPixelId) {
    return false;
  }

  const allowed = loadScriptWithConsent({
    id: "naashpati-meta-src",
    src: "https://connect.facebook.net/en_US/fbevents.js",
    category: COOKIE_CATEGORIES.marketing,
  });

  if (!allowed) {
    if (typeof window.fbq === "function") {
      window.fbq("consent", "revoke");
    }
    return false;
  }

  if (typeof window.fbq !== "function") {
    window.fbq = function fbq() {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
    };
    window.fbq.queue = [];
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
  }

  window.fbq("init", trackerConfig.metaPixelId);
  window.fbq("consent", "grant");
  window.fbq("track", "PageView");
  return true;
};

const syncTrackersWithConsent = () => {
  const analyticsAllowed = canUseCookieCategory(COOKIE_CATEGORIES.analytics);
  const marketingAllowed = canUseCookieCategory(COOKIE_CATEGORIES.marketing);

  if (trackerConfig.ga4MeasurementId) {
    window[`ga-disable-${trackerConfig.ga4MeasurementId}`] = !analyticsAllowed;
  }

  if (analyticsAllowed) {
    ensureGa4();
    ensureGtm();
  }

  if (marketingAllowed) {
    ensureMetaPixel();
  } else if (typeof window.fbq === "function") {
    window.fbq("consent", "revoke");
  }
};

let stopListening = null;

export const initConsentAwareTrackers = () => {
  if (stopListening) {
    return stopListening;
  }

  syncTrackersWithConsent();
  stopListening = onConsentChange(() => {
    syncTrackersWithConsent();
  });

  return () => {
    if (stopListening) {
      stopListening();
      stopListening = null;
    }
  };
};

export const getConsentTrackerConfig = () => ({ ...trackerConfig });
