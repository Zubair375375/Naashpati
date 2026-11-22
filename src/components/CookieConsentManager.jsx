import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  COOKIE_PREFERENCE_OPEN_EVENT,
  applyConsentGlobals,
  getStoredConsent,
  normalizeConsentRecord,
  removeOptionalCookiesForConsent,
  saveConsent,
} from "../utils/cookieConsent";

const defaultChoices = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onChange(!checked);
          }
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#68a300]" : "bg-gray-300"
        } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  </div>
);

const CookieConsentManager = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [choices, setChoices] = useState(defaultChoices);

  useEffect(() => {
    const existing = getStoredConsent();

    if (!existing) {
      const defaults = normalizeConsentRecord({ choices: defaultChoices });
      applyConsentGlobals(defaults);
      removeOptionalCookiesForConsent(defaults.choices);
      setChoices(defaults.choices);
      setIsBannerVisible(true);
      return;
    }

    const normalized = applyConsentGlobals(existing);
    removeOptionalCookiesForConsent(normalized.choices);
    setChoices(normalized.choices);
    setIsBannerVisible(false);
  }, []);

  useEffect(() => {
    const handleOpenPreferences = () => {
      setIsPanelOpen(true);
      setIsBannerVisible(false);
    };

    window.addEventListener(
      COOKIE_PREFERENCE_OPEN_EVENT,
      handleOpenPreferences,
    );
    return () =>
      window.removeEventListener(
        COOKIE_PREFERENCE_OPEN_EVENT,
        handleOpenPreferences,
      );
  }, []);

  const persistAndApply = (nextChoices) => {
    const normalized = saveConsent({ choices: nextChoices });
    applyConsentGlobals(normalized);
    removeOptionalCookiesForConsent(normalized.choices);
    setChoices(normalized.choices);
    setIsBannerVisible(false);
    setIsPanelOpen(false);
  };

  const acceptAll = () => {
    persistAndApply({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectOptional = () => {
    persistAndApply({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const savePreferences = () => {
    persistAndApply({
      essential: true,
      functional: Boolean(choices.functional),
      analytics: Boolean(choices.analytics),
      marketing: Boolean(choices.marketing),
    });
  };

  const hasUnsavedChanges = useMemo(() => {
    const stored = getStoredConsent();
    if (!stored) {
      return true;
    }

    return (
      Boolean(stored.choices?.functional) !== Boolean(choices.functional) ||
      Boolean(stored.choices?.analytics) !== Boolean(choices.analytics) ||
      Boolean(stored.choices?.marketing) !== Boolean(choices.marketing)
    );
  }, [choices]);

  return (
    <>
      {isBannerVisible && (
        <div className="fixed bottom-4 left-1/2 z-[140] w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 animate-[fadeInUp_260ms_ease-out] rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_18px_48px_rgba(0,0,0,0.16)] sm:p-6">
          <h2 className="text-lg font-semibold text-[#111827]">
            We Value Your Privacy
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Naashpati uses cookies to ensure our website works properly, improve
            your shopping experience, remember your preferences, and understand
            how visitors interact with our store. You can accept all cookies,
            reject optional cookies, or customize your preferences. Read our{" "}
            <Link
              to="/privacy"
              className="font-medium text-[#2162a1] underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsPanelOpen(true)}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Customize Preferences
            </button>
            <button
              type="button"
              onClick={rejectOptional}
              className="rounded-full border border-[#111111] bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition hover:bg-[#f7f7f7]"
            >
              Reject Optional
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-full bg-[#68a300] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f9600]"
            >
              Accept All
            </button>
          </div>
        </div>
      )}

      {isPanelOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-[#f9fafb] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#111827]">
                  Cookie Preferences
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Manage how Naashpati uses optional cookies. Essential cookies
                  are always active to keep cart, checkout, and account
                  functionality working.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <ToggleRow
                title="Essential Cookies"
                description="Always active. Required for cart, checkout, security, and session management."
                checked
                disabled
                onChange={() => {}}
              />
              <ToggleRow
                title="Functional Cookies"
                description="Remember your preferences and improve website functionality."
                checked={Boolean(choices.functional)}
                onChange={(nextValue) =>
                  setChoices((prev) => ({ ...prev, functional: nextValue }))
                }
              />
              <ToggleRow
                title="Analytics Cookies"
                description="Help us understand visitor behavior, traffic, and popular products."
                checked={Boolean(choices.analytics)}
                onChange={(nextValue) =>
                  setChoices((prev) => ({ ...prev, analytics: nextValue }))
                }
              />
              <ToggleRow
                title="Marketing Cookies"
                description="Support advertising measurement, campaign tracking, and personalized marketing."
                checked={Boolean(choices.marketing)}
                onChange={(nextValue) =>
                  setChoices((prev) => ({ ...prev, marketing: nextValue }))
                }
              />
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={rejectOptional}
                className="rounded-full border border-[#111111] bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition hover:bg-[#f3f3f3]"
              >
                Reject Optional Cookies
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full border border-[#68a300] bg-white px-4 py-2 text-sm font-semibold text-[#68a300] transition hover:bg-[#f2f8e7]"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-full bg-[#68a300] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f9600] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!hasUnsavedChanges}
              >
                Save My Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsentManager;
