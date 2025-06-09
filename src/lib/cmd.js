import cp from "node:child_process";
import { config } from "./config.js";

export function executeScript(script) {
  const full_path = `${config.paths.scripts}/${script}`;

  const child = cp.exec(full_path);
  child.stdout?.on("data", (data) => process.stdout.write(data));
  child.stderr?.on("data", (data) => process.stderr.write(data));
  child.on("close", (code) => {
    if (code !== 0) {
      process.stderr.write(`El proceso falló con codigo de error ${code}`);
      process.exit(1);
    }
    console.log("El proceso finalizó correctamente");
  });
}

