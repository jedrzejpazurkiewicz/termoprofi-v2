import { Resend } from "resend";

/**
 * Lazy Resend client.
 *
 * The Resend SDK THROWS if constructed without an API key, so we must never
 * build it at module load — otherwise Next's "collect page data" step crashes
 * the production build on any environment without RESEND_API_KEY (e.g. a Vercel
 * preview that hasn't had the secret added yet).
 *
 * Returns null when the key is absent; the route handler then responds
 * gracefully instead of crashing. Once RESEND_API_KEY is set (server env), the
 * client is created on first use and cached.
 */
let client: Resend | null = null;

export function getResend(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}
