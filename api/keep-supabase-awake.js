function json(response, status, body) {
  response.status(status);
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    json(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.authorization !== `Bearer ${cronSecret}`) {
    json(response, 401, { ok: false, error: "Unauthorized" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    json(response, 500, {
      ok: false,
      error: "Missing SUPABASE_URL/SUPABASE_ANON_KEY or VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY"
    });
    return;
  }

  try {
    const rpcResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/keepalive_ping`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json"
      },
      body: "{}"
    });

    const text = await rpcResponse.text();
    const payload = text ? JSON.parse(text) : null;

    if (!rpcResponse.ok) {
      json(response, 502, { ok: false, status: rpcResponse.status, supabase: payload });
      return;
    }

    json(response, 200, { ok: true, supabase: payload });
  } catch (error) {
    json(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}
