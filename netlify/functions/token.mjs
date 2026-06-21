// Same-origin token BFF.
//
// Performs the anonymous OAuth `client_credentials` grant against the openct auth service
// *server-side*, so the storefront client secret never ships in the browser bundle. The SPA
// GETs `/api/token` (mapped here via netlify.toml) instead of doing HTTP-Basic auth itself.
//
// Netlify Functions v2 (default export). Configuration comes from the Netlify **runtime** env
// (set in the site dashboard — NOT committed):
//   CLIENT_SECRET  (required — the storefront OAuth client secret; no fallback by design)
//   CLIENT_ID      (optional, default "lumora-store")
//   PROJECT_KEY    (optional, default "openct-dev")
//   AUTH_BASE_URL  (optional, default the live demo auth service)
export default async () => {
  const AUTH = process.env.AUTH_BASE_URL || 'https://openct-auth.onrender.com';
  const PROJECT_KEY = process.env.PROJECT_KEY || 'openct-dev';
  const CLIENT_ID = process.env.CLIENT_ID || 'lumora-store';
  const CLIENT_SECRET = process.env.CLIENT_SECRET; // runtime-only; intentionally no fallback

  const json = (status, obj) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });

  // If the secret isn't configured, fail loud rather than silently. This is the failure mode if
  // the BFF is deployed before CLIENT_SECRET is set in the Netlify env — the store stays down
  // (by design) until it's configured, instead of falling back to an insecure in-browser grant.
  if (!CLIENT_SECRET) {
    return json(500, {
      error: 'server_misconfigured',
      error_description: 'CLIENT_SECRET is not set in the Netlify runtime environment.',
    });
  }

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  // One upstream attempt per invocation, time-boxed below Netlify's synchronous function
  // timeout (~10s) so we return promptly. The browser retries `/api/token` with backoff to ride
  // out Render free-tier cold starts (20-50s), each retry being a fresh function invocation.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(`${AUTH}/oauth/${PROJECT_KEY}/anonymous/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return json(res.status, {
        error: data.error || 'token_error',
        error_description: data.error_description,
      });
    }
    // Pass through only what the client needs — never echo the full upstream payload.
    return json(200, {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    });
  } catch (e) {
    return json(502, {
      error: 'upstream_unavailable',
      error_description: e?.name === 'AbortError' ? 'Auth service timed out.' : String(e?.message || e),
    });
  } finally {
    clearTimeout(timer);
  }
};
