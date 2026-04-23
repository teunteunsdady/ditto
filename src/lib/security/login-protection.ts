type FailureEntry = {
  failCount: number;
  lockUntil: number;
  lastFailedAt: number;
};

type FailureStore = Map<string, FailureEntry>;

declare global {
  // eslint-disable-next-line no-var
  var __loginFailureStore__: FailureStore | undefined;
}

const FAILURE_RESET_MS = 30 * 60 * 1000; // 30분
const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15분

function getStore() {
  if (!globalThis.__loginFailureStore__) {
    globalThis.__loginFailureStore__ = new Map<string, FailureEntry>();
  }
  return globalThis.__loginFailureStore__;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function buildKey(request: Request, email: string) {
  return `${getClientIp(request)}:${email.toLowerCase()}`;
}

export function getLoginLockStatus(request: Request, email: string) {
  const now = Date.now();
  const key = buildKey(request, email);
  const store = getStore();
  const current = store.get(key);

  if (!current) {
    return { locked: false, retryAfterSeconds: 0 };
  }

  if (current.lastFailedAt + FAILURE_RESET_MS <= now) {
    store.delete(key);
    return { locked: false, retryAfterSeconds: 0 };
  }

  if (current.lockUntil > now) {
    return {
      locked: true,
      retryAfterSeconds: Math.max(1, Math.ceil((current.lockUntil - now) / 1000)),
      failCount: current.failCount,
    };
  }

  return { locked: false, retryAfterSeconds: 0, failCount: current.failCount };
}

export function registerLoginFailure(request: Request, email: string) {
  const now = Date.now();
  const key = buildKey(request, email);
  const store = getStore();
  const current = store.get(key);

  if (!current || current.lastFailedAt + FAILURE_RESET_MS <= now) {
    store.set(key, {
      failCount: 1,
      lockUntil: 0,
      lastFailedAt: now,
    });
    return { locked: false, failCount: 1 };
  }

  const failCount = current.failCount + 1;
  const lockUntil = failCount >= LOCK_THRESHOLD ? now + LOCK_DURATION_MS : 0;
  const updated: FailureEntry = {
    failCount,
    lockUntil,
    lastFailedAt: now,
  };
  store.set(key, updated);

  return {
    locked: lockUntil > now,
    failCount,
    retryAfterSeconds: lockUntil > now ? Math.ceil((lockUntil - now) / 1000) : 0,
  };
}

export function clearLoginFailures(request: Request, email: string) {
  const key = buildKey(request, email);
  getStore().delete(key);
}

