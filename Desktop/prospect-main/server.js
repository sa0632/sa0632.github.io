require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;

// Load all the api handlers
const search = require("./api/functions/search");
const auth = require("./api/functions/auth");
const authCallback = require("./api/functions/auth-callback");
const gmailDraft = require("./api/functions/gmail-draft");

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ── CORS headers so the browser doesn't block requests ──
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // ── API routes ──────────────────────────────────────────
  if (pathname === "/api/search") {
    const event = { queryStringParameters: parsed.query };
    const result = await search.handler(event);
    res.writeHead(result.statusCode, { "Content-Type": "application/json" });
    res.end(result.body);
    return;
  }

  if (pathname === "/api/auth") {
    const result = await auth.handler();
    res.writeHead(result.statusCode, result.headers || {});
    res.end(result.body || "");
    return;
  }

  if (pathname === "/api/auth-callback") {
    const event = { queryStringParameters: parsed.query };
    const result = await authCallback.handler(event);
    res.writeHead(result.statusCode, result.headers || {});
    res.end(result.body || "");
    return;
  }

  if (pathname === "/api/gmail-draft") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      const event = { httpMethod: "POST", body };
      const result = await gmailDraft.handler(event);
      res.writeHead(result.statusCode, { "Content-Type": "application/json" });
      res.end(result.body);
    });
    return;
  }

  // ── Serve static files (index.html, css, etc.) ─────────
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
    res.writeHead(200, { "Content-Type": types[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n✅ Prospect is running!`);
  console.log(`👉 Open this in your browser: http://localhost:${PORT}\n`);
});
