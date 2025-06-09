import cp from "node:child_process";
import path from "node:path";
import url from "node:url";
import { config } from "./config.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function executeScript(script, args) {
  const full_path = path.resolve(config.paths.scripts, script);
  const child = cp.exec(`${full_path} ${args.join(" ")}`, {
    env: envs()
  });
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

export function envs() {
  // TODO: probably make commands envs be set by each command
  // commands will want to use different values for OC_SERVER for example

  const oc_config_path = path.resolve(__dirname, "../../configs/.kube/config");
  const oc_cache_path = path.resolve(__dirname, "../../configs/.kube/cache");
  return {
    OC: `oc --kubeconfig=${oc_config_path} --cache-dir=${oc_cache_path}`,
    // TODO: Maybe not needed, I think that having them be written in oc kubeconfig is enough
    OC_TOKEN: config.user.oc.cuyo.token,
    OC_SERVER: config.user.oc.cuyo.server
  };
}

