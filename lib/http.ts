import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 8_192) throw new Error("So‘rov hajmi juda katta.");
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("So‘rov tanasi bo‘sh.");
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 8_192) {
        await reader.cancel();
        throw new Error("So‘rov hajmi juda katta.");
      }
      chunks.push(value);
    }
    const body = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(body));
  } catch (error) {
    if (error instanceof Error && error.message === "So‘rov hajmi juda katta.") throw error;
    throw new Error("JSON formatidagi so‘rov yuboring.");
  }
}

export function enforceSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost?.split(",")[0]?.trim() || request.headers.get("host");
  try {
    return Boolean(host && new URL(origin).host === host);
  } catch {
    return false;
  }
}

type Bucket = { count: number; resetAt: number };
const globalForRateLimit = globalThis as unknown as { authRateLimit?: Map<string, Bucket> };
const buckets = globalForRateLimit.authRateLimit ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") globalForRateLimit.authRateLimit = buckets;

export function rateLimit(request: Request, key: string, limit = 8, windowMs = 15 * 60_000) {
  const now = Date.now();
  if (buckets.size > 10_000) {
    buckets.forEach((value, bucketKey) => { if (value.resetAt <= now) buckets.delete(bucketKey); });
  }
  const address = request.headers.get("x-real-ip") || "unknown";
  const bucketKey = `${address}:${key}`;
  const bucket = buckets.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= limit, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
}
