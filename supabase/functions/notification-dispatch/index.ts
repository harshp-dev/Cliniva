Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), { status: 405 });
  }

  const payload = await req.json();

  // Integrate SMS/Email providers in production and avoid including PHI in outbound payloads.
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        dispatched: true,
        channel: payload.channel ?? "in_app"
      }
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
