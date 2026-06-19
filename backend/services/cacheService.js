import crypto from "crypto";
import { getRedisClient } from "../config/redis.js";

const KEY_PREFIX = "naashpati:cache:v1";
const MEMORY_CACHE_MAX_KEYS = 500;
const memoryCache = new Map();

const getMemoryValue = (key) => {
  const item = memoryCache.get(key);
  if (!item) return null;

  if (item.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return item.value;
};

const setMemoryValue = (key, value, ttlSeconds) => {
  if (memoryCache.size >= MEMORY_CACHE_MAX_KEYS) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) {
      memoryCache.delete(firstKey);
    }
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

const normalizeUrl = (url = "") => {
  const parsed = new URL(url, "http://localhost");
  const params = [...parsed.searchParams.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  parsed.search = "";

  const query = new URLSearchParams(params).toString();
  return `${parsed.pathname}${query ? `?${query}` : ""}`;
};

export const buildCacheKey = (namespace, rawKey) => {
  const hash = crypto
    .createHash("sha1")
    .update(normalizeUrl(rawKey))
    .digest("hex");

  return `${KEY_PREFIX}:${namespace}:${hash}`;
};

export const getCachedJson = async (key) => {
  const client = await getRedisClient();

  if (client) {
    const payload = await client.get(key);
    if (!payload) return null;

    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  return getMemoryValue(key);
};

export const setCachedJson = async (key, value, ttlSeconds) => {
  const client = await getRedisClient();

  if (client) {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return;
  }

  setMemoryValue(key, value, ttlSeconds);
};

export const invalidateCacheNamespaces = async (namespaces = []) => {
  const normalizedNamespaces = Array.isArray(namespaces)
    ? namespaces.filter(Boolean)
    : [namespaces].filter(Boolean);

  if (normalizedNamespaces.length === 0) return;

  const client = await getRedisClient();

  if (client) {
    for (const namespace of normalizedNamespaces) {
      let cursor = "0";
      do {
        const result = await client.scan(cursor, {
          MATCH: `${KEY_PREFIX}:${namespace}:*`,
          COUNT: 100,
        });

        cursor = result.cursor;
        if (result.keys?.length) {
          await client.del(result.keys);
        }
      } while (cursor !== "0");
    }
    return;
  }

  for (const key of memoryCache.keys()) {
    if (
      normalizedNamespaces.some((namespace) =>
        key.startsWith(`${KEY_PREFIX}:${namespace}:`),
      )
    ) {
      memoryCache.delete(key);
    }
  }
};
