import cp from "node:child_process";
import path from "node:path";
import url from "node:url";
import { config } from "./config.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function executeScript(
  script,
  {
    args,
    onStdOut,
    // TODO: maybe not necessary, maybe every command that handles
    // stdout with onStdOut should suprressOriginalStdout so it does
    // not print
    supressStdout
  }
) {
  const full_path = path.resolve(config.paths.scripts, script);

  const result = cp.execSync(`${full_path} ${args?.join(" ") ?? ""}`, {
    env: envs(),
    stdio: ["pipe", supressStdout ? "pipe" : "inherit", "pipe"]
  }).toString();
  onStdOut?.(result);
}

export function envs() {
  // TODO: probably make commands envs be set by each command
  // commands will want to use different values for OC_SERVER for example

  const oc_config_path = path.resolve(__dirname, "../../configs/.kube/config");
  const oc_cache_path = path.resolve(__dirname, "../../configs/.kube/cache");
  return {
    OC: `oc --kubeconfig=${oc_config_path} --cache-dir=${oc_cache_path}`,
    // TODO: Maybe not needed, I think that having them be written in oc's kubeconfig is enough
    OC_TOKEN: config.user.oc.cuyo.token,
    OC_SERVER: config.user.oc.cuyo.server
  };
}

export function clearConsole() {
  process.stdout.write("\x1Bc");
}
