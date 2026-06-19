import {
  buildCacheKey,
  getCachedJson,
  invalidateCacheNamespaces,
  setCachedJson,
} from "../services/cacheService.js";

const hasAuthHeader = (req) =>
  typeof req.headers.authorization === "string" &&
  req.headers.authorization.trim().length > 0;

export const skipAuthenticatedOrDraftRequests = (req) => {
  if (req.user || hasAuthHeader(req)) return true;
  if (req.query.includeDraft === "true") return true;
  if (String(req.query.status || "").toLowerCase() === "draft") return true;
  return false;
};

export const cacheResponse = (
  namespace,
  ttlSeconds = 60,
  { skip = () => false } = {},
) => {
  return async (req, res, next) => {
    if (req.method !== "GET" || req.query.cache === "false" || skip(req)) {
      return next();
    }

    const cacheKey = buildCacheKey(namespace, req.originalUrl);

    try {
      const cached = await getCachedJson(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(cached);
      }
    } catch (error) {
      console.error("[Cache] Read error:", error.message);
    }

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode === 200 && body?.success !== false) {
        setCachedJson(cacheKey, body, ttlSeconds).catch((error) => {
          console.error("[Cache] Write error:", error.message);
        });
      }

      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    return next();
  };
};

export const invalidateCacheOnSuccess = (namespaces) => {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCacheNamespaces(namespaces).catch((error) => {
          console.error("[Cache] Invalidation error:", error.message);
        });
      }
    });

    next();
  };
};
