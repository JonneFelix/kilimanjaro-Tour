import { spawn } from "bun";

console.log("Starting Kilimanjaro Prep App...");

const backend = spawn(["bun", "run", "--watch", "backend/src/index.ts"], {
  stdout: "inherit",
  stderr: "inherit",
});

const frontend = spawn(["bun", "run", "dev"], {
  cwd: "frontend",
  stdout: "inherit",
  stderr: "inherit",
});

process.on("SIGINT", () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

