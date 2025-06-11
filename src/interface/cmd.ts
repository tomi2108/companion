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
  return {
    SCRIPTS_REPO_PATH: Config.get().global.scripts_dir,
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

