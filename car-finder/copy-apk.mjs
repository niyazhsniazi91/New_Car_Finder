import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(root, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const destination = path.join(root, "..", "CAR_FINDER_S23_ULTRA.apk");

await copyFile(source, destination);
console.log(`Copied debug APK to ${destination}`);
