import crypto from "crypto";

const SLOW_ROUTE_THRESHOLD_MS = Number(
  process.env.SLOW_ROUTE_THRESHOLD_MS || 1200,
);
const CRITICAL_SLOW_ROUTE_THRESHOLD_MS = Number(
  process.env.CRITICAL_SLOW_ROUTE_THRESHOLD_MS || 3000,
);
const API_MONITOR_FLUSH_INTERVAL_MS = Number(
  process.env.API_MONITOR_FLUSH_INTERVAL_MS || 60_000,
);
const API_MONITOR_MAX_SAMPLES = Number(
  process.env.API_MONITOR_MAX_SAMPLES || 2000,
);

const minuteStats = new Map();

const nowMsFromNs = (durationNs) => Number(durationNs) / 1_000_000;

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const isSlowApiRoute = (durationMs) => durationMs >= SLOW_ROUTE_THRESHOLD_MS;
const isCriticalSlowApiRoute = (durationMs) =>
  durationMs >= CRITICAL_SLOW_ROUTE_THRESHOLD_MS;

const getCurrentMinuteBucket = () =>
  new Date().toISOString().slice(0, 16).replace("T", " ");

const normalizeRoutePath = (rawPath = "") =>
  rawPath
    .split("?")[0]
    .replace(/[a-f0-9]{24}(?=\/|$)/gi, ":id")
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?=\/|$)/gi,
      ":uuid",
    )
    .replace(/\/(\d+)(?=\/|$)/g, "/:num");

const getStatsKey = (method, path) => `${method} ${normalizeRoutePath(path)}`;

const getPercentile = (values, percentile) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((percentile / 100) * sorted.length) - 1),
  );
  return sorted[index];
};

const recordMinuteStats = ({
  method,
  path,
  statusCode,
  durationMs,
  slow,
  criticalSlow,
}) => {
  const minuteBucket = getCurrentMinuteBucket();
  const routeKey = getStatsKey(method, path);
  const aggregateKey = `${minuteBucket}|${routeKey}`;

  const existing = minuteStats.get(aggregateKey) || {
    minuteBucket,
    route: routeKey,
    requestCount: 0,
    error5xxCount: 0,
    slowCount: 0,
    criticalSlowCount: 0,
    totalDurationMs: 0,
    maxDurationMs: 0,
    samples: [],
  };

  existing.requestCount += 1;
  existing.error5xxCount += statusCode >= 500 ? 1 : 0;
  existing.slowCount += slow ? 1 : 0;
  existing.criticalSlowCount += criticalSlow ? 1 : 0;
  existing.totalDurationMs += durationMs;
  existing.maxDurationMs = Math.max(existing.maxDurationMs, durationMs);
  if (existing.samples.length < API_MONITOR_MAX_SAMPLES) {
    existing.samples.push(durationMs);
  }

  minuteStats.set(aggregateKey, existing);
};

const flushMinuteStats = () => {
  if (minuteStats.size === 0) {
    return;
  }

  const currentBucket = getCurrentMinuteBucket();
  for (const [key, stats] of minuteStats.entries()) {
    // Keep current in-progress minute and flush completed minute windows.
    if (stats.minuteBucket >= currentBucket) {
      continue;
    }

    const avgDurationMs = stats.requestCount
      ? stats.totalDurationMs / stats.requestCount
      : 0;
    const p95DurationMs = getPercentile(stats.samples, 95);
    const shouldLog =
      stats.error5xxCount > 0 ||
      stats.criticalSlowCount > 0 ||
      stats.slowCount > 0;

    if (shouldLog) {
      const payload = {
        level:
          stats.error5xxCount > 0 || stats.criticalSlowCount > 0
            ? "error"
            : "warn",
        event: "api.route_minute_summary",
        minuteBucket: stats.minuteBucket,
        route: stats.route,
        requestCount: stats.requestCount,
        error5xxCount: stats.error5xxCount,
        slowCount: stats.slowCount,
        criticalSlowCount: stats.criticalSlowCount,
        avgDurationMs: Number(avgDurationMs.toFixed(2)),
        p95DurationMs: Number(p95DurationMs.toFixed(2)),
        maxDurationMs: Number(stats.maxDurationMs.toFixed(2)),
        thresholdMs: SLOW_ROUTE_THRESHOLD_MS,
        criticalThresholdMs: CRITICAL_SLOW_ROUTE_THRESHOLD_MS,
        timestamp: new Date().toISOString(),
      };

      const serialized = JSON.stringify(payload);
      if (payload.level === "error") {
        console.error(serialized);
      } else {
        console.warn(serialized);
      }
    }

    minuteStats.delete(key);
  }
};

const flushInterval = setInterval(flushMinuteStats, API_MONITOR_FLUSH_INTERVAL_MS);
if (typeof flushInterval.unref === "function") {
  flushInterval.unref();
}

export const apiMonitor = (req, res, next) => {
  const startNs = process.hrtime.bigint();
  const requestId =
    req.headers["x-request-id"]?.toString().trim() || crypto.randomUUID();

  req.requestId = requestId;
  req._requestStartNs = startNs;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const durationMs = nowMsFromNs(process.hrtime.bigint() - startNs);
    const statusCode = res.statusCode;
    const criticalSlow = isCriticalSlowApiRoute(durationMs);
    const slow = isSlowApiRoute(durationMs);
    const isError = statusCode >= 500;

    recordMinuteStats({
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      slow,
      criticalSlow,
    });

    // Per-request logs are limited to severe events to avoid noise.
    if (!criticalSlow && !isError) {
      return;
    }

    const level = isError || criticalSlow ? "error" : "warn";
    const event = isError
      ? "api.error_response"
      : criticalSlow
        ? "api.critical_slow_route"
        : "api.slow_route";

    const payload = {
      level,
      event,
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      thresholdMs: SLOW_ROUTE_THRESHOLD_MS,
      criticalThresholdMs: CRITICAL_SLOW_ROUTE_THRESHOLD_MS,
      ip: getClientIp(req),
      userAgent: req.headers["user-agent"] || "unknown",
      timestamp: new Date().toISOString(),
    };

    const serialized = JSON.stringify(payload);
    if (level === "error") {
      console.error(serialized);
      return;
    }

    console.warn(serialized);
  });

  next();
};
