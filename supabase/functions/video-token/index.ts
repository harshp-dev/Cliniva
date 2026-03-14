import { AccessToken } from "npm:twilio@5.5.3/lib/jwt/AccessToken.js";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), { status: 405 });
  }

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const apiKey = Deno.env.get("TWILIO_API_KEY");
  const apiSecret = Deno.env.get("TWILIO_API_SECRET");

  if (!accountSid || !apiKey || !apiSecret) {
    return new Response(JSON.stringify({ success: false, error: "Twilio env vars are missing" }), { status: 500 });
  }

  const { room_name, identity } = await req.json();
  const videoGrant = new AccessToken.VideoGrant({ room: room_name });
  const token = new AccessToken(accountSid, apiKey, apiSecret, { identity });
  token.addGrant(videoGrant);

  return new Response(JSON.stringify({ success: true, data: { token: token.toJwt() } }), {
    headers: { "Content-Type": "application/json" }
  });
});
