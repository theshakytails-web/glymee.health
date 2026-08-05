import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface RateLimitStatus {
  ok: boolean;
  retryAfterMs: number;
}

function nowMs(): number {
  return Date.now();
}

async function getBucket(
  key: string,
  windowMs: number
): Promise<{ count: number; windowStart: number }> {
  const [row] = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.key, key))
    .limit(1);

  if (!row) {
    const bucket = { count: 0, windowStart: nowMs() };
    await db.insert(rateLimits).values({
      key,
      count: 0,
      windowStart: new Date(bucket.windowStart),
      updatedAt: new Date(),
    });
    return bucket;
  }

  const windowStart = new Date(row.windowStart).getTime();
  if (nowMs() - windowStart >= windowMs) {
    const bucket = { count: 0, windowStart: nowMs() };
    await db
      .update(rateLimits)
      .set({ count: 0, windowStart: new Date(bucket.windowStart), updatedAt: new Date() })
      .where(eq(rateLimits.key, key));
    return bucket;
  }

  return { count: row.count, windowStart };
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitStatus> {
  const bucket = await getBucket(key, windowMs);
  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: windowMs - (nowMs() - bucket.windowStart) };
  }
  return { ok: true, retryAfterMs: 0 };
}

export async function consumeRateLimit(key: string, windowMs: number): Promise<void> {
  const bucket = await getBucket(key, windowMs);
  await db
    .update(rateLimits)
    .set({ count: bucket.count + 1, updatedAt: new Date() })
    .where(eq(rateLimits.key, key));
}

export function getClientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
