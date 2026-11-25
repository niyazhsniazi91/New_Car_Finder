import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, "www");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of ["index.html", "styles.css", "app.js", "cars.json", "cardekho-specs.json", "manifest.webmanifest", "sw.js", "icon.svg"]) {
  const source = path.join(root, "src", name);
  const target = path.join(out, name);
  if (name === "sw.js") {
    const contents = (await readFile(source, "utf8")).replaceAll("__BUILD_ID__", Date.now().toString(36));
    await writeFile(target, contents, "utf8");
  } else {
    await cp(source, target);
  }
}
await mkdir(path.join(out, "vendor"), { recursive: true });
await cp(path.join(root, "node_modules", "pdfjs-dist", "build", "pdf.mjs"), path.join(out, "vendor", "pdf.js"));
await cp(path.join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.mjs"), path.join(out, "vendor", "pdf.worker.js"));
console.log(`Built offline web app at ${out}`);
