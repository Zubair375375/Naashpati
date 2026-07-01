import { lazy } from "react";

const RETRY_FLAG_PREFIX = "naashpati:lazy-retried:";

const isChunkLoadError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("chunkloaderror")
  );
};

export const lazyWithRetry = (importer, key) =>
  lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      const cacheKey = `${RETRY_FLAG_PREFIX}${key}`;
      const canUseStorage = typeof window !== "undefined";
      const hasRetried = canUseStorage
        ? window.sessionStorage.getItem(cacheKey) === "1"
        : true;

      if (!hasRetried && isChunkLoadError(error)) {
        if (canUseStorage) {
          window.sessionStorage.setItem(cacheKey, "1");
          window.location.reload();
        }

        return new Promise(() => {});
      }

      if (canUseStorage) {
        window.sessionStorage.removeItem(cacheKey);
      }

      throw error;
    }
  });
