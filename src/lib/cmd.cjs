const cp = require("node:child_process");
const path = require("node:path");
const config = require("./config.cjs");

function executeScript(
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

function envs() {
  // TODO: probably make commands envs be set by each command
  // commands will want to use different values for OC_SERVER for example

  return {
    GLAB_CONFIG_DIR: config.global.glab_config_path,
    // TODO: I dont think these are needed... will see
    // GITLAB_HOST: config.gitlab.server,
    // GITLAB_API_HOST: config.gitlab.server,
    // GITLAB_TOKEN: config.gitlab.token,
    // TODO: OC_TOKEN && OC_SERVER may not be needed for the scripts...
    // we can maybe write the config file for each cluster/context
    // deriving from namespaces && config.openshift.(...).token
    // I think if we write the config in a smart and careful way
    // oc will just know the context when we run `oc project $project`
    // OC_TOKEN: config.openshift.cuyo.token,
    // OC_SERVER: config.openshift.cuyo.server,
    //  I think oc_tokens expire too quickly, we may be bound to using
    //  username and password... will investigate
    OC_USER: config.openshift.cuyo.username,
    OC_PASS: config.openshift.cuyo.password,
    LOGS_PATH: config.preferences.logs_path,
    OC: `oc --kubeconfig=${config.global.oc_config_path} --cache-dir=${config.global.oc_cache_path}`,
    BROWSER: config.preferences.browser,
    EDITOR: config.preferences.editor
  };
}

function clearConsole() {
  process.stdout.write("\x1Bc");
}

module.exports = { clearConsole, executeScript };

