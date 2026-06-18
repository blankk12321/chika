const REQUIRED_FIELDS = ["name", "email", "projectType", "message"];
const CONTACT_EMAIL = "yunimentalworking@gmail.com";
const CONTACT_WHATSAPP = "+86 18938580209";
const MAX_ATTACHMENT_FILES = 5;
const MAX_ATTACHMENT_FILE_BYTES = 30 * 1024 * 1024;
const MAX_ATTACHMENT_TOTAL_BYTES = 100 * 1024 * 1024;

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

    let fields;
    try {
      fields = normalizeRfq(body);
    } catch (error) {
      return json({ ok: false, message: error.message || "Invalid RFQ attachment." }, 400, env);
    }

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

    const emailAttachments = fields.attachments;
    const record = {
      ...fields,
      attachments: emailAttachments.map(attachmentMetadata),
      source: "chika-act-site",
      submittedAt: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || "",
      ipCountry: request.cf?.country || "",
    };

    await Promise.allSettled([storeRfq(record, env), notifyByEmail(record, env, emailAttachments)]);

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
    targetMarket: clean(body.targetMarket),
    annualVolume: clean(body.annualVolume),
    material: clean(body.material),
    surfaceFinish: clean(body.surfaceFinish),
    message: clean(body.message, 4000),
    pageUrl: clean(body.pageUrl, 1000),
    website: clean(body.website),
    attachments: normalizeAttachments(body.attachments),
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

function normalizeAttachments(value) {
  const attachments = Array.isArray(value) ? value : [];
  const normalized = attachments
    .map((file) => ({
      filename: clean(file?.filename, 180),
      contentType: clean(file?.contentType || "application/octet-stream", 120),
      size: Number(file?.size || 0),
      content: String(file?.content || ""),
    }))
    .filter((file) => file.filename && file.content);

  if (normalized.length > MAX_ATTACHMENT_FILES) {
    throw new Error(`Please upload up to ${MAX_ATTACHMENT_FILES} files.`);
  }

  const totalBytes = normalized.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_ATTACHMENT_TOTAL_BYTES) {
    throw new Error("Your uploaded files are over 100 MB total. Please email large CAD packages directly.");
  }

  for (const file of normalized) {
    if (!Number.isFinite(file.size) || file.size < 0) {
      throw new Error("One uploaded file has an invalid size.");
    }

    if (file.size > MAX_ATTACHMENT_FILE_BYTES) {
      throw new Error(`${file.filename} is over 30 MB. Please compress it, split the package, or email it directly.`);
    }

    if (!/^[A-Za-z0-9+/=]+$/.test(file.content)) {
      throw new Error("One uploaded file could not be read correctly.");
    }
  }

  return normalized;
}

function attachmentMetadata(file) {
  return {
    filename: file.filename,
    contentType: file.contentType,
    size: file.size,
  };
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

async function notifyByEmail(record, env, attachments = []) {
  const recipients = parseEmailList(env.RFQ_TO_EMAIL);

  if (!env.RESEND_API_KEY || recipients.length === 0) {
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
    `Target market: ${record.targetMarket || "Not provided"}`,
    `Annual volume: ${record.annualVolume || "Not provided"}`,
    `Material: ${record.material || "Not provided"}`,
    `Surface finish: ${record.surfaceFinish || "Not provided"}`,
    `Message: ${record.message}`,
    `Attachments: ${record.attachments?.length ? record.attachments.map((file) => `${file.filename} (${formatBytes(file.size)})`).join(", ") : "None"}`,
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
      to: recipients,
      subject: `CHIKA Manufacturing RFQ - ${record.projectType}`,
      text: lines.join("\n"),
      reply_to: record.email,
      attachments: attachments.map((file) => ({
        filename: file.filename,
        content: file.content,
        content_type: file.contentType,
      })),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email provider rejected RFQ notification: ${text}`);
  }
}

function parseEmailList(value) {
  return String(value || "")
    .split(",")
    .map((email) => email.trim())
    .filter(isValidEmail);
}

function formatBytes(value) {
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
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
