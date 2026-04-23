type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitState>;

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore__: RateLimitStore | undefined;
}

function getStore(): RateLimitStore {
  if (!globalThis.__rateLimitStore__) {
    globalThis.__rateLimitStore__ = new Map<string, RateLimitState>();
  }
  return globalThis.__rateLimitStore__;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

export function checkRateLimit(
  request: Request,
  key: string,
  maxRequests: number,
  windowMs: number,
) {
  const now = Date.now();
  const ip = getClientIp(request);
  const scopedKey = `${key}:${ip}`;
  const store = getStore();
  const current = store.get(scopedKey);

  if (!current || current.resetAt <= now) {
    store.set(scopedKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      ok: true,
      remaining: maxRequests - 1,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= maxRequests) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(scopedKey, current);
  return {
    ok: true,
    remaining: Math.max(0, maxRequests - current.count),
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
