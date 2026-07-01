const STORAGE_PREFIX = "naashpati:idempotency:";

export const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2);
  return `idemp-${Date.now()}-${randomPart}`;
};

const buildStorageKey = (scope, resourceId = "default") =>
  `${STORAGE_PREFIX}${scope}:${resourceId}`;

export const getOrCreateScopedIdempotencyKey = (scope, resourceId = "default") => {
  if (!scope) {
    return createIdempotencyKey();
  }

  const storageKey = buildStorageKey(scope, resourceId);

  if (typeof window !== "undefined") {
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) {
      return existing;
    }
  }

  const key = createIdempotencyKey();

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(storageKey, key);
  }

  return key;
};

export const clearScopedIdempotencyKey = (scope, resourceId = "default") => {
  if (!scope || typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(buildStorageKey(scope, resourceId));
};