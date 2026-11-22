// Serves a built site with the headers of render.yaml, so what is tested is what gets deployed.
// usage: node scripts/serve-site.mjs [directory] [port]. It only listens on 127.0.0.1.
import { readFileSync, realpathSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
};

export function headerRules(yaml) {
  return [...yaml.matchAll(/^ +- path: (\S+)\n(?: +#.*\n)* +name: (\S+)\n(?: +#.*\n)* +value: (.+)$/gm)].map(([, path, name, value]) => ({
    path,
    name,
    value: value.replace(/^"(.*)"$/, "$1"),
  }));
}

export function serveSite({ dir, port = 4173, rules }) {
  const squeezed = new Map();
  const server = createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405).end();
      return;
    }
    let file;
    let path;
    try {
      path = decodeURIComponent(new URL(request.url, "http://site.local").pathname);
      // Resolved each time: a new build is a new target of the same link.
      const root = realpathSync(dir);
      file = realpathSync(resolve(root, `.${path === "/" ? "/index.html" : path}`));
      if (!file.startsWith(root + sep) || !statSync(file).isFile()) throw new Error("outside");
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain", "Cache-Control": "no-store" }).end("Not found");
      return;
    }
    const type = TYPES[extname(file)] ?? "application/octet-stream";
    const headers = { "Content-Type": type, Vary: "Accept-Encoding" };
    for (const rule of rules) {
      if (rule.path === path || (rule.path.endsWith("*") && path.startsWith(rule.path.slice(0, -1)))) headers[rule.name] = rule.value;
    }
    let body = readFileSync(file);
    if (/text|json/.test(type) && /\bgzip\b/.test(request.headers["accept-encoding"] ?? "")) {
      const stamp = `${file}:${statSync(file).mtimeMs}`;
      if (!squeezed.has(stamp)) {
        if (squeezed.size > 64) squeezed.clear();
        squeezed.set(stamp, gzipSync(body));
      }
      body = squeezed.get(stamp);
      headers["Content-Encoding"] = "gzip";
    }
    response.writeHead(200, { ...headers, "Content-Length": body.length });
    response.end(request.method === "HEAD" ? undefined : body);
  });
  return new Promise((done, failed) => {
    server.once("error", failed);
    server.listen(port, "127.0.0.1", () => done(server));
  });
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const root = new URL("..", import.meta.url);
  const dir = resolve(process.argv[2] ?? fileURLToPath(new URL("dist", root)));
  const server = await serveSite({ dir, port: Number(process.argv[3] ?? 4173), rules: headerRules(readFileSync(new URL("render.yaml", root), "utf8")) });
  process.stdout.write(`serving ${dir} on http://127.0.0.1:${server.address().port}\n`);
}
