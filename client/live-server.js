import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const srcDir = path.join(__dirname, "src");
const port = Number(process.env.PORT || 5173);
const clients = new Set();

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

const runBuild = () => {
  return new Promise((resolve, reject) => {
    const viteBin = path.join(__dirname, "node_modules", "vite", "bin", "vite.js");
    const child = spawn(process.execPath, [viteBin, "build"], {
      cwd: __dirname,
      stdio: "inherit",
      shell: false
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Client build failed with code ${code}`));
      }
    });
  });
};

const injectLiveReload = (html) => {
  const script = `
    <script>
      const source = new EventSource("/__task_manager_productivity_dashboard_live");
      source.onmessage = (event) => {
        if (event.data === "reload") window.location.reload();
      };
    </script>
  `;

  return html.replace("</body>", `${script}</body>`);
};

const serveFile = (req, res) => {
  if (req.url === "/__task_manager_productivity_dashboard_live") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  const safePath = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
  const requestedPath = path.normalize(path.join(distDir, safePath));
  const isInsideDist = requestedPath.startsWith(distDir);
  const filePath =
    isInsideDist && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
      ? requestedPath
      : path.join(distDir, "index.html");

  fs.readFile(filePath, "utf8", (textError, textContent) => {
    if (!textError && path.extname(filePath) === ".html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(injectLiveReload(textContent));
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end("Unable to serve Task Manager and Productivity Dashboard.");
        return;
      }

      res.writeHead(200, {
        "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
      });
      res.end(content);
    });
  });
};

let buildTimer;
const scheduleBuild = () => {
  clearTimeout(buildTimer);
  buildTimer = setTimeout(async () => {
    try {
      await runBuild();
      for (const client of clients) {
        client.write("data: reload\n\n");
      }
      console.log("Rebuilt Task Manager and Productivity Dashboard client. Browser reloaded.");
    } catch (error) {
      console.error(error.message);
    }
  }, 250);
};

await runBuild();

fs.watch(srcDir, { recursive: true }, scheduleBuild);
fs.watch(path.join(__dirname, "index.html"), scheduleBuild);

http.createServer(serveFile).listen(port, "127.0.0.1", () => {
  console.log(`Task Manager and Productivity Dashboard live server running at http://127.0.0.1:${port}`);
});
