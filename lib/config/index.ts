import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import open from "open";
import openEditor from "open-editor";

import log from "@lib/log";
import { confirm, search } from "@lib/ui";
import { deepMerge, removePrefix, removeSuffix } from "@lib/utils";

import { AppConfig } from "./app";
import { DynatraceConfig } from "./dynatrace";
import { EnvsConfig } from "./envs";
import { GitlabConfig } from "./glab";
import { JiraConfig } from "./jira";
import { MigrationsConfig } from "./migrations";
import { OpenShiftConfig } from "./oc";
import { PathsConfig } from "./paths";
import { PreferencesConfig } from "./preferences";
import { ProjectConfig } from "./project";
import { ReposConfig } from "./repos";
import { SonarConfig } from "./sonar";
import { SqlConfig } from "./sql";
import { TasksConfig } from "./tasks";
import { ThreescaleConfig } from "./threescale";
import { VaultConfig } from "./vault";

export async function openInBrowser(url: string) {
  const browser = Config.get().preferences.browser;
  if (browser) open(url, { app: { name: browser } });
  else open(url);
}

export async function openInEditor(full_path: string, opts?: { wait?: boolean }) {
  await openEditor([{ file: full_path }], { wait: opts?.wait ?? false, editor: Config.get().preferences.editor });
}

const homeDir = os.homedir();
const configs_dir = path.resolve(__dirname, "../../configs");
const config_file = process.env.COMPANION_CONFIG ?? getConfigPath();

function getConfigPath() {
  if (process.platform === "win32") return path.join(homeDir, "AppData", "Roaming", "companion", "config.json");
  else if (process.platform === "darwin" || process.platform === "linux") return path.join(homeDir, ".config", "companion", "config.json");
  throw new Error("Unknown platform");
}

class Config {
  static config: Config | null = null;
  openshift = new OpenShiftConfig();
  gitlab = new GitlabConfig();
  jira = new JiraConfig();
  vault = new VaultConfig();
  sonar = new SonarConfig();
  preferences = new PreferencesConfig();
  threescale = new ThreescaleConfig();
  paths = new PathsConfig();
  dynatrace = new DynatraceConfig();
  repos = new ReposConfig();
  migrations = new MigrationsConfig();
  envs = new EnvsConfig();
  app = new AppConfig();
  project = new ProjectConfig();
  sql = new SqlConfig();
  tasks = new TasksConfig();

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

    const config_to_write = {
      team: preset !== "default" ? preset : null,
      openshift: await this.openshift.setup(),
      gitlab: await this.gitlab.setup(),
      paths: await this.paths.setup(),
      jira: await this.jira.setup(),
      sonar: await this.sonar.setup(),
      vault: await this.vault.setup(),
      preferences: await this.preferences.setup()
    };

    const dir = path.dirname(getConfigPath());
    const exists = fs.existsSync(dir);
    if (!exists) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(config_file, JSON.stringify(config_to_write, null, 2));
    log.success("Configuration was set up correctly");
  }

  async prod() {
    // TODO: implement
  }

  private async newConfigPrompt() {
    log.warning("Configuration file config.json for Companion was not found");
    const setup = await confirm({ message: "Would you like to setup a config interactively?" });
    if (setup) await this.setup();
    process.exit(0);
  }

  async load() {
    let file_content = "";
    try {
      file_content = fs.readFileSync(config_file).toString();
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") await this.newConfigPrompt();
      else throw err;
    }

    const configKeys = Object.keys(this);
    const parsed = JSON.parse(file_content);
    const validatedConfig = Object.fromEntries(
      configKeys.map(
        (c) => {
          const configObj = this[c as keyof Config];
          if (!("validate" in configObj)) return [];
          const configSlice = parsed[c];
          const validated = configObj.validate(configSlice);
          return [c, validated];
        }
      )
    );

    configKeys.forEach((key) => {
      const k = key as keyof Config;
      if (validatedConfig.team && this.isValidTeamKey(validatedConfig.team)) {
        this[k] = deepMerge(this[k], this.getTeamConfig(validatedConfig.team)[key]);
      }
      this[k] = deepMerge(this[k], validatedConfig[key]);
    });

  }

  private getAvailablePresets() {
    const files = fs.readdirSync(configs_dir)
      .filter((n) => !n.includes("example") && n.startsWith("config.") && n.endsWith("json"));
    return files.map((n) => removeSuffix(removePrefix(n, "config."), ".json"));
  }

  private isValidTeamKey(key: string) {
    const keys = this.getAvailablePresets();
    return keys.includes(key);
  }

  private getTeamConfig(key: string) {
    const team_config_file = path.join(configs_dir, `config.${key}.json`);
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
