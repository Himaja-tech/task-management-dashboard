import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "..", "client", "dist");
const port = Number(process.env.PREVIEW_PORT || 5173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const safePath = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
  const requestedPath = path.normalize(path.join(distDir, safePath));
  const isInsideDist = requestedPath.startsWith(distDir);
  const filePath = isInsideDist && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
    ? requestedPath
    : path.join(distDir, "index.html");

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end("Unable to serve Task Manager and Productivity Dashboard preview.");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    res.end(content);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Task Manager and Productivity Dashboard preview running at http://127.0.0.1:${port}`);
});
