import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "www");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml" };
createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const target = path.resolve(root, `.${urlPath === "/" ? "/index.html" : urlPath}`);
    if (!target.startsWith(root + path.sep) && target !== path.join(root, "index.html")) throw new Error("Invalid path");
    const info = await stat(target);
    if (!info.isFile()) throw new Error("Not found");
    res.writeHead(200, { "Content-Type": types[path.extname(target)] ?? "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(await readFile(target));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(4173, "0.0.0.0", () => console.log("Car Finder running at http://localhost:4173"));
