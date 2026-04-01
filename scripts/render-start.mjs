import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js");

if (!existsSync(viteCli)) {
  console.error("vite CLI not found; run npm install");
  process.exit(1);
}

const port = String(process.env.PORT || "4173");

const child = spawn(
  process.execPath,
  [viteCli, "preview", "--host", "0.0.0.0", "--port", port],
  { cwd: root, stdio: "inherit" }
);

child.on("exit", (code) => process.exit(code ?? 0));
