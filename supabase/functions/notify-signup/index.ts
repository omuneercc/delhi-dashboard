// Deno edge function — triggered by a Supabase Database Webhook on
// INSERT into `profiles`. Sends an email to the super admin via Resend
// so they know someone is waiting for approval.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPER_ADMIN_EMAIL = "omuneercc@gmail.com";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const newUserEmail = payload?.record?.email ?? "someone";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Delhi k Zaiqay Dashboard <onboarding@resend.dev>",
        to: [SUPER_ADMIN_EMAIL],
        subject: "New signup waiting for approval — Delhi k Zaiqay Dashboard",
        html: `
          <p><strong>${newUserEmail}</strong> just created an account on the Delhi k Zaiqay admin dashboard and is waiting for approval.</p>
          <p>Sign in and use the <strong>Admin</strong> button (bottom-right corner) to approve or reject this request.</p>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return new Response(errText, { status: 500 });
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
});
