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
    env: { ...process.env, ...envs() },
    stdio: ["inherit", supressStdout ? "pipe" : "inherit", "inherit"]
  });

  if (result) return result.toString();
}

export function envs() {
  // TODO: probably make commands envs be set by each command
  // commands will want to use different values for OC_SERVER for example

  return {
    GLAB_CONFIG_DIR: config.global.glab_config_path,
    // TODO: I dont think these are needed... will see
    // GITLAB_HOST: config.user.glab.server,
    // GITLAB_API_HOST: config.user.glab.server,
    // GITLAB_TOKEN: config.user.glab.token,
    // TODO: OC_TOKEN && OC_SERVER may not be needed for the scripts...
    // we can maybe write the config file for each cluster/context
    // deriving from namespaces && config.user.oc.(...).token
    // I think if we write the config in a smart and careful way
    // oc will just know the context when we run `oc project $project`
    // OC_TOKEN: config.user.oc.cuyo.token,
    // OC_SERVER: config.user.oc.cuyo.server,
    //  I think oc_tokens expire too quickly, we may be bound to using
    //  username and password... will investigate
    OC_USER: config.user.oc.cuyo.username,
    OC_PASS: config.user.oc.cuyo.password,
    LOGS_PATH: config.preferences.logs_path,
    OC: `oc --kubeconfig=${config.global.oc_config_path} --cache-dir=${config.global.oc_cache_path}`
  };
}

export function clearConsole() {
  process.stdout.write("\x1Bc");
}
