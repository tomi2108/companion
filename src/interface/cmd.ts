import cp from "node:child_process";
import path from "node:path";
import { Config } from "../lib/config";

type Opts = {
  path?: string;
  supressStdout?: boolean;
  args?: string[];
  cwd?: string;
};

export function executeScript(script: string, opts?: Opts) {
  const full_path = path.join(opts?.path ?? Config.get().global.scripts_dir, script);

  const result = cp.spawnSync(`${full_path}`, opts?.args, {
    cwd: opts?.cwd,
    env: { ...process.env, ...envs() },
    stdio: ["inherit", opts?.supressStdout ? "pipe" : "inherit", "inherit"]
  });

  if (result.stdout) return result.stdout.toString();
  return "";
}

function envs() {
  // TODO: probably make commands envs be set by each command
  // commands will want to use different values for OC_SERVER for example

  return {
    SCRIPTS_REPO_PATH: Config.get().global.scripts_dir,
    // TODO: OC_TOKEN && OC_SERVER may not be needed for the scripts...
    // we can maybe write the Config.get() file for each cluster/context
    // deriving from namespaces && Config.get().openshift.(...).token
    // I think if we write the Config.get() in a smart and careful way
    // oc will just know the context when we run `oc project $project`
    // OC_TOKEN: Config.get().openshift.token,
    // OC_SERVER: Config.get().openshift.server_cuyo,
    //  I think oc_tokens expire too quickly, we may be bound to using
    //  username and password... will investigate
    // IMPORTANT:  oc has an oc options command that lists all options that
    // can be passed in to any command. I think we should use this instead
    // of maintaining a kubeconfig file, --kubeconfig still needs to exist I believe
    // or else oc will create kubeconfigs on cwd. Look into --server and --cluster, and
    // inject them in OC env. We need a way to change server by command, each command can use any
    //  server but only one, and a way to change cluster in the same command (a command gets a list
    //  of clusters and chan choose to use any of them) If cluster === project, if not then this is nonesense
    NODE_OPTIONS: "--max-old-space-size=8192",
    TKN: `tkn --kubeconfig=${Config.get().global.oc_config_path}`,
    OC: `oc --kubeconfig=${Config.get().global.oc_config_path} --cache-dir=${Config.get().global.oc_cache_path}`,
    OC_USER: Config.get().openshift.username,
    OC_PASS: Config.get().openshift.password,
    JIRA_PROJECT_KEY: Config.get().jira.project_key,
    JIRA_USER: Config.get().jira.username,
    JIRA_API_TOKEN: Config.get().jira.token,
    JIRA_DOMAIN: Config.get().jira.server,
    LOGS_PATH: Config.get().preferences.logs_path,
    BROWSER: Config.get().preferences.browser,
    EDITOR: Config.get().preferences.editor
  };
}

export function clearConsole() {
  process.stdout.write("\x1Bc");
}

