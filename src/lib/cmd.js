import cp from "node:child_process";
import path from "node:path";
import { config } from "./config.js";

export function executeScript(
  script,
  {
    args,
    supressStdout
  }
) {
  const full_path = path.resolve(config.paths.scripts, script);

  const result = cp.execSync(`${full_path} ${args?.join(" ") ?? ""}`, {
    env: envs(),
    stdio: ["inherit", supressStdout ? "pipe" : "inherit", "inherit"]
  });

  if (result) return result.toString();
}

export function envs() {
  // TODO: probably make commands envs be set by each command
  // commands will want to use different values for OC_SERVER for example

  return {
    OC: `oc --kubeconfig=${config.global.oc_config_path} --cache-dir=${config.global.oc_cache_path}`,
    // TODO: Maybe not needed, I think that having them be written in oc's kubeconfig is enough
    OC_TOKEN: config.user.oc.cuyo.token,
    OC_SERVER: config.user.oc.cuyo.server
  };
}

export function clearConsole() {
  process.stdout.write("\x1Bc");
}
