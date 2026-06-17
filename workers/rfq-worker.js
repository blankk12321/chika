const REQUIRED_FIELDS = ["name", "email", "projectType", "message"];
const CONTACT_EMAIL = "yunimentalworking@gmail.com";
const CONTACT_WHATSAPP = "+86 18938580209";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method === "GET" && url.pathname === "/healthz") {
      return json({ ok: true, service: "chika-rfq-worker" }, 200, env);
    }

    if (request.method !== "POST" || url.pathname !== "/api/rfq") {
      return json({ ok: false, message: "Not found." }, 404, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, message: "Invalid JSON body." }, 400, env);
    }

    const fields = normalizeRfq(body);

    if (fields.website) {
      return json({ ok: true, message: "Thank you. Your RFQ was received." }, 200, env);
    }

    for (const field of REQUIRED_FIELDS) {
      if (!fields[field]) {
        return json({ ok: false, message: `Please provide ${field}.` }, 400, env);
      }
    }

    if (!isValidEmail(fields.email)) {
      return json({ ok: false, message: "Please provide a valid company email." }, 400, env);
    }

    const record = {
      ...fields,
      source: "chika-act-site",
      submittedAt: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || "",
      ipCountry: request.cf?.country || "",
    };

    await Promise.allSettled([storeRfq(record, env), notifyByEmail(record, env)]);

    return json(
      {
        ok: true,
        message: `Thank you. Your RFQ was received. You can also email ${CONTACT_EMAIL} or WhatsApp ${CONTACT_WHATSAPP}.`,
      },
      200,
      env,
    );
  },
};

function normalizeRfq(body) {
  return {
    name: clean(body.name),
    email: clean(body.email),
    company: clean(body.company),
    country: clean(body.country),
    projectType: clean(body.projectType),
    annualVolume: clean(body.annualVolume),
    material: clean(body.material),
    surfaceFinish: clean(body.surfaceFinish),
    message: clean(body.message, 4000),
    pageUrl: clean(body.pageUrl, 1000),
    website: clean(body.website),
  };
}

function clean(value, limit = 500) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function storeRfq(record, env) {
  if (env.RFQ_KV) {
    await env.RFQ_KV.put(`rfq:${record.submittedAt}:${crypto.randomUUID()}`, JSON.stringify(record));
  }

  if (env.RFQ_LOG_URL) {
    await fetch(env.RFQ_LOG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  }
}

async function notifyByEmail(record, env) {
  if (!env.RESEND_API_KEY || !env.RFQ_TO_EMAIL) {
    console.log("RFQ email notification skipped: RESEND_API_KEY or RFQ_TO_EMAIL is not configured.");
    console.log(JSON.stringify(record));
    return;
  }

  const lines = [
    "New RFQ from CHIKA Manufacturing website",
    "",
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    `Company: ${record.company || "Not provided"}`,
    `Country: ${record.country || "Not provided"}`,
    `Project type: ${record.projectType}`,
    `Annual volume: ${record.annualVolume || "Not provided"}`,
    `Material: ${record.material || "Not provided"}`,
    `Surface finish: ${record.surfaceFinish || "Not provided"}`,
    `Message: ${record.message}`,
    `Page: ${record.pageUrl || "Not provided"}`,
    `Submitted: ${record.submittedAt}`,
  ];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RFQ_FROM_EMAIL || "CHIKA Manufacturing RFQ <onboarding@resend.dev>",
      to: [env.RFQ_TO_EMAIL],
      subject: `CHIKA Manufacturing RFQ - ${record.projectType}`,
      text: lines.join("\n"),
      reply_to: record.email,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email provider rejected RFQ notification: ${text}`);
  }
}

function json(payload, status, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(env),
    },
  });
}

function corsHeaders(env) {
  const origin = env?.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
