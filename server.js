const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const rootDir = __dirname;

loadEnvFile(path.join(rootDir, ".env"));

const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jp2": "image/jp2",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/healthz") {
      sendJson(response, 200, { ok: true, service: "chika-manufacturing-site" });
      return;
    }

    if (request.method === "POST" && request.url === "/api/rfq") {
      await handleLocalRfq(request, response);
      return;
    }

    if (request.method === "POST" && request.url === "/api/feishu-rfq") {
      await handleRfq(request, response);
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      await serveStatic(request, response);
      return;
    }

    sendJson(response, 405, { ok: false, message: "Method not allowed." });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { ok: false, message: "Server error. Please try again later." });
  }
});

if (require.main === module) {
  server.listen(port, () => {
    console.log(`CHIKA Manufacturing site listening on http://localhost:${port}`);
  });
}

module.exports = {
  server,
  createFeishuSign,
};

async function handleRfq(request, response) {
  const body = await readJsonBody(request);
  const fields = normalizeRfq(body);

  if (fields.website) {
    sendJson(response, 200, { ok: true, message: "Thank you. Your RFQ was received." });
    return;
  }

  if (!fields.name || !fields.email) {
    sendJson(response, 400, { ok: false, message: "Please enter your name and company email." });
    return;
  }

  const webhookUrl = process.env.FEISHU_WEBHOOK_URL || process.env.LARK_WEBHOOK_URL;
  if (!webhookUrl) {
    sendJson(response, 503, {
      ok: false,
      message: "Feishu webhook is not configured yet. Add FEISHU_WEBHOOK_URL to .env.",
    });
    return;
  }

  const feishuResponse = await postToFeishu(webhookUrl, fields);
  if (!feishuResponse.ok) {
    sendJson(response, 502, {
      ok: false,
      message: "Feishu did not accept this RFQ. Please email yunimentalworking@gmail.com instead.",
      detail: feishuResponse.message,
    });
    return;
  }

  sendJson(response, 200, { ok: true, message: "Thank you. Your RFQ was sent to our team." });
}

async function handleLocalRfq(request, response) {
  const body = await readJsonBody(request);
  const fields = normalizeB2bRfq(body);

  if (fields.website) {
    sendJson(response, 200, { ok: true, message: "Thank you. Your RFQ was received." });
    return;
  }

  if (!fields.name || !fields.email || !fields.projectType || !fields.message) {
    sendJson(response, 400, {
      ok: false,
      message: "Please enter your name, company email, project type, and requirement summary.",
    });
    return;
  }

  console.log("Local RFQ preview:", fields);
  sendJson(response, 200, {
    ok: true,
    message: "Thank you. Your RFQ was received. We will review it and reply by email or WhatsApp.",
  });
}

function normalizeB2bRfq(body) {
  return {
    name: cleanText(body.name),
    email: cleanText(body.email),
    company: cleanText(body.company),
    country: cleanText(body.country),
    projectType: cleanText(body.projectType),
    annualVolume: cleanText(body.annualVolume),
    material: cleanText(body.material),
    surfaceFinish: cleanText(body.surfaceFinish),
    message: cleanText(body.message),
    pageUrl: cleanText(body.pageUrl),
    website: cleanText(body.website),
    submittedAt: new Date().toISOString(),
  };
}

function normalizeRfq(body) {
  return {
    name: cleanText(body.name),
    email: cleanText(body.email),
    project: cleanText(body.project) || "Not specified",
    volume: cleanText(body.volume) || "Not specified",
    message: cleanText(body.message) || "Not specified",
    website: cleanText(body.website),
    page: cleanText(body.page),
    submittedAt: new Date().toISOString(),
  };
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

async function postToFeishu(webhookUrl, fields) {
  const text = [
    "New RFQ from CHIKA Manufacturing website",
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Project type: ${fields.project}`,
    `Annual volume: ${fields.volume}`,
    `Requirement: ${fields.message}`,
    `Page: ${fields.page || "Not provided"}`,
    `Submitted: ${fields.submittedAt}`,
  ].join("\n");

  const payload = {
    msg_type: "text",
    content: { text },
  };

  const secret = process.env.FEISHU_WEBHOOK_SECRET || process.env.LARK_WEBHOOK_SECRET;
  if (secret) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    payload.timestamp = timestamp;
    payload.sign = createFeishuSign(timestamp, secret);
  }

  const result = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const responseText = await result.text();

  let parsed = null;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = { raw: responseText };
  }

  const feishuOk =
    result.ok &&
    (parsed.StatusCode === 0 || parsed.code === 0 || parsed.status_code === 0 || parsed.msg === "success");

  return {
    ok: feishuOk,
    message: parsed.msg || parsed.message || parsed.StatusMessage || responseText,
  };
}

function createFeishuSign(timestamp, secret) {
  const stringToSign = `${timestamp}\n${secret}`;
  return crypto.createHmac("sha256", stringToSign).update("").digest("base64");
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);
  const safePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  let filePath = path.resolve(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  let stat = await fs.promises.stat(filePath).catch(() => null);
  if (stat && stat.isDirectory()) {
    filePath = path.join(filePath, "index.html");
    stat = await fs.promises.stat(filePath).catch(() => null);
  }
  if (!stat || !stat.isFile()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Content-Length": stat.size,
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(filePath).pipe(response);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}
