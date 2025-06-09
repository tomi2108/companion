const cp = require("node:child_process");
const path = require("node:path");
const config = require("../lib/config.cjs");

function executeScript(script, opts) {
  const full_path = path.join(config.global.scripts_dir, script);

  const result = cp.execSync(`${full_path} ${opts?.args?.join(" ") ?? ""}`, {
    env: { ...process.env, ...envs() },
    stdio: ["inherit", opts?.supressStdout ? "pipe" : "inherit", "inherit"]
  });

  if (result) return result.toString();
}

function envs() {
  // TODO: probably make commands envs be set by each command
  // commands will want to use different values for OC_SERVER for example

  return {
    SCRIPTS_REPO_PATH: config.global.scripts_dir,
    GLAB_CONFIG_DIR: config.global.glab_config_path,
    GITLAB_HOST: config.gitlab.server,
    GITLAB_API_HOST: config.gitlab.server,
    GITLAB_TOKEN: config.gitlab.token,
    // TODO: OC_TOKEN && OC_SERVER may not be needed for the scripts...
    // we can maybe write the config file for each cluster/context
    // deriving from namespaces && config.openshift.(...).token
    // I think if we write the config in a smart and careful way
    // oc will just know the context when we run `oc project $project`
    // OC_TOKEN: config.openshift.token,
    // OC_SERVER: config.openshift.server_cuyo,
    //  I think oc_tokens expire too quickly, we may be bound to using
    //  username and password... will investigate
    // IMPORTANT:  oc has an oc options command that lists all options that
    // can be passed in to any command. I think we should use this instead
    // of maintaining a kubeconfig file, --kubeconfig still needs to exist I believe
    // or else oc will create kubeconfigs on cwd. Look into --server and --cluster, and
    // inject them in OC env. We need a way to change server by command, each command can use any
    //  server but only one, and a way to change cluster in the same command (a command gets a list
    //  of clusters and chan choose to use any of them) If cluster === project, if not then this is nonesense
    GITLAB_USER: config.gitlab.username,
    OC: `oc --kubeconfig=${config.global.oc_config_path} --cache-dir=${config.global.oc_cache_path}`,
    OC_USER: config.openshift.username,
    OC_PASS: config.openshift.password,
    JIRA_PROJECT_KEY: config.jira.project_key,
    JIRA_USER: config.jira.username,
    JIRA_API_TOKEN: config.jira.token,
    JIRA_DOMAIN: config.jira.server,
    LOGS_PATH: config.preferences.logs_path,
    BROWSER: config.preferences.browser,
    EDITOR: config.preferences.editor
  };
}

function clearConsole() {
  process.stdout.write("\x1Bc");
}

module.exports = { clearConsole, executeScript };

