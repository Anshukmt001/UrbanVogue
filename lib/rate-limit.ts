export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10000;

function prune(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function hit(
  key: string,
  windowMs: number,
  limit: number,
  now: number = Date.now()
): RateLimitResult {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(
  request: Request,
  options: { limit: number; windowMs: number; keyParts?: string[] }
): RateLimitResult {
  const { limit, windowMs, keyParts = [] } = options;

  if (!Number.isFinite(limit) || limit < 1) {
    return { allowed: true };
  }

  const ip = getClientIp(request);
  const key = ["rl", ip, ...keyParts].join("|");

  prune(Date.now());
  return hit(key, windowMs, limit);
}