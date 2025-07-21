import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import open from "open";
import openEditor from "open-editor";

import log from "@lib/log";
import { confirm, input, password, search } from "@lib/ui";
import { deepMerge, removePrefix, removeSuffix } from "@lib/utils";

import { ConfigSchema, DynatraceConfig, EnvsConfig, GitlabConfig, JiraConfig, OpenShiftConfig, PathsConfig, PreferencesConfig, ReposConfig, SonarConfig, ThreeScaleConfig, VaultConfig } from "./validations";

export async function openInBrowser(url: string) {
  const browser = Config.get().preferences.browser;
  if (browser) open(url, { app: { name: browser } });
  else open(url);
}

export async function openInEditor(full_path: string, opts?: { wait?: boolean }) {
  await openEditor([{ file: full_path }], { wait: opts?.wait ?? false, editor: Config.get().preferences.editor });
}

const homeDir = os.homedir();

function getConfigPath() {
  if (process.platform === "win32") return path.join(homeDir, "AppData", "Roaming", "companion", "config.json");
  else if (process.platform === "darwin" || process.platform === "linux") return path.join(homeDir, ".config", "companion", "config.json");
  throw new Error("Unknown platform");
}
const config_file = process.env.COMPANION_CONFIG ?? getConfigPath();

class Config {
  static config: Config | null = null;
  global = {
    configs_dir: path.resolve(__dirname, "../../configs"),
    tmp_dir: path.resolve(__dirname, "../../tmp")
  };

  openshift: OpenShiftConfig = {
    auth_server_cuyo: "https://oauth-openshift.apps.ocpnp.cuyorh.tcloud.ar",
    auth_server_barracas: "https://oauth-openshift.apps.ocpnp.brcrh.tcloud.ar",
    server_cuyo: "api.ocpnp.cuyorh.tcloud.ar:6443",
    server_barracas: "api.ocpnp.brcrh.tcloud.ar:6443"
  } as OpenShiftConfig;

  gitlab: GitlabConfig = {
    server: "https://gitlab-ee.agil.movistar.com.ar",
    ms_template_id: 6399
  } as GitlabConfig;

  jira: JiraConfig = {
    server: "ar-telefonicahispam.atlassian.net",
    labels: [] as string[]
  } as JiraConfig;

  preferences: PreferencesConfig = {
    logs_path: path.resolve(__dirname, "../../logs"),
    editor: process.env.EDITOR ?? "vi",
    browser: process.env.BROWSER ?? "firefox"
  };

  vault: VaultConfig = {
    server: "https://vault.agil.movistar.com.ar"
  } as VaultConfig;

  sonar: SonarConfig = {
    server: "https://sonarqube.agil.movistar.com.ar"
  } as SonarConfig;

  threescale: ThreeScaleConfig = {} as ThreeScaleConfig;
  paths: PathsConfig = {} as PathsConfig;
  dynatrace: DynatraceConfig = {} as DynatraceConfig;
  repos: ReposConfig = {} as ReposConfig;
  envs: EnvsConfig = {} as EnvsConfig;

  static get() {
    if (this.config === null) this.config = new Config();
    return this.config;
  }

  private constructor() { }

  open() {
    openInEditor(config_file);
  }

  async setup() {
    const presets = this.getAvailablePresets();

    const preset = await search({
      message: "Select a preset or default config",
      choices: [...presets, "default"]
    });

    const oc_user = await input({ message: "Enter Openshift username" });
    const oc_password = await password({ message: "Enter Openshift password" });

    const glab_user = await input({ message: "Enter Gitlab username" });
    const glab_token = await password({ message: `Enter Gitlab auth token (${this.gitlab.server}/-/user_settings/personal_access_tokens)` });

    const jira_user = await input({ message: "Enter Jira username" });
    const jira_token = await password({ message: "Enter Jira auth token (https://id.atlassian.com/manage-profile/security/api-tokens)" });

    const vault_token = await password({ message: `Enter Vault auth token (${this.vault.server}/ui/vault/secrets)` });

    const backend = await input({ message: "Where do you store backend repositories?" });
    const frontend = await input({ message: "Where do you store frontend repositories?" });
    const despliegues = await input({ message: "Where do you store despliegues repositories?" });
    const threescale = await input({ message: "Where do you store threescale repositories?" });
    const argocd = await input({ message: "Where do you store argocd repositories?" });
    const vault = await input({ message: "Where do you store vault repositories?" });

    const config_to_write = {
      team: preset !== "default" ? preset : null,
      paths: {
        backend,
        frontend,
        despliegues,
        threescale,
        argocd,
        vault
      },
      openshift: {
        username: oc_user,
        password: oc_password
      },
      gitlab: {
        username: glab_user,
        token: glab_token
      },
      vault: {
        token: vault_token
      },
      jira: {
        username: jira_user,
        token: jira_token
      }
    };

    fs.writeFileSync(config_file, JSON.stringify(config_to_write, null, 2));
    log.success("Configuration was set up correctly");
  }

  async load() {
    let file_content = "";
    try {
      file_content = fs.readFileSync(config_file).toString();
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
        log.warning("Configuration file config.json for Companion was not found");
        const setup = await confirm({ message: "Would you like to setup a config interactively?" });
        if (setup) await this.setup();
        process.exit(0);
      } else throw err;
    }
    const readConfig = ConfigSchema.parse(JSON.parse(file_content));

    ([
      "jira",
      "gitlab",
      "openshift",
      "vault",
      "dynatrace",
      "paths",
      "preferences",
      "threescale",
      "sonar",
      "envs",
      "repos"
    ] as const).forEach((key) => {
      if (readConfig.team && this.isValidTeamKey(readConfig.team)) {
        this[key] = deepMerge(this[key], this.getTeamConfig(readConfig.team)[key]);
      }
      this[key] = deepMerge(this[key], readConfig[key]);
    });
  }

  private getAvailablePresets() {
    const files = fs.readdirSync(this.global.configs_dir)
      .filter((n) => !n.includes("example") && n.startsWith("config.") && n.endsWith("json"));
    return files.map((n) => removeSuffix(removePrefix(n, "config."), ".json"));
  }

  private isValidTeamKey(key: string) {
    const keys = this.getAvailablePresets();
    return keys.includes(key);
  }

  private getTeamConfig(key: string) {
    const team_config_file = path.resolve(__dirname, `../../configs/config.${key}.json`);
    const team_config = fs.readFileSync(team_config_file).toString();
    return JSON.parse(team_config);
  }

}

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type DotNestedKeys<T> = (T extends object ?
  { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
  : "") extends infer D ? Extract<D, string> : never;

class ConfigError extends Error {
  constructor(key: DotNestedKeys<Omit<Config, "config">>) {
    const msg = `${key} not set`;
    log.error(`ConfigError: ${msg}`);
    super(msg);
  }
}

export { Config, ConfigError };
