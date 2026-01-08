import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { JsonFile } from "@files/json_file";
import { ExecutionContext } from "@lib/ctx";
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

const homeDir = os.homedir();
const configs_dir = path.resolve(__dirname, "../../../configs");

export function getConfigPath() {
  if (process.env.MARO_CONFIG) return process.env.MARO_CONFIG;
  if (process.platform === "win32") return path.join(homeDir, "AppData", "Roaming", "maro", "config.json");
  else if (process.platform === "darwin" || process.platform === "linux") {
    const maro = path.join(homeDir, ".config", "maro", "config.json");
    const companion = path.join(homeDir, ".config", "companion", "config.json");
    if (fs.existsSync(maro)) return maro;
    return companion;
  }
  throw new Error("Unknown platform");
}

export class Config {
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

  async setup(ctx: ExecutionContext) {
    const presets = this.getAvailablePresets();

    const preset = await ctx.ui.search({
      message: "Select a preset or default config",
      choices: [...presets, "default"]
    });

    const config_to_write = {
      team: preset !== "default" ? preset : null,
      openshift: await this.openshift.setup(ctx),
      gitlab: await this.gitlab.setup(ctx),
      paths: await this.paths.setup(ctx),
      jira: await this.jira.setup(ctx),
      sonar: await this.sonar.setup(ctx),
      vault: await this.vault.setup(ctx),
      preferences: await this.preferences.setup(ctx)
    };

    const dir = path.dirname(getConfigPath());
    const exists = fs.existsSync(dir);
    if (!exists) fs.mkdirSync(dir, { recursive: true });
    this.file().write(config_to_write);
    const log = ctx.logger;
    log.success(`Configuration written to ${this.file()}`);
  }

  async prod() {
    this.openshift.prod();
  }

  async create(ctx: ExecutionContext) {
    const log = ctx.logger;
    const ui = ctx.ui;
    log.warning("Configuration file config.json for maro was not found");
    const setup = await ui.confirm({ message: "Would you like to setup a config interactively?" });
    if (setup) await this.setup(ctx);
    process.exit(0);
  }

  file() {
    return new JsonFile(getConfigPath());
  }

  async load() {
    const config = this.file().read();
    const configKeys = Object.keys(this);
    const team = config.team
      && typeof config.team === "string"
      && this.isValidTeamKey(config.team)
      ? config.team
      : undefined;

    const validatedConfig = {
      team,
      ...Object.fromEntries(
        configKeys.map(
          (c) => {
            const configObj = this[c as keyof Config];
            if (!("validate" in configObj)) return [];
            const configSlice = config[c];
            const validated = configObj.validate(configSlice);
            return [c, validated];
          }
        )
      )
    };

    configKeys.forEach((key) => {
      const k = key as keyof Config;
      if (validatedConfig.team) {
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

export function getByPath(obj: Config, path: ConfigKey) {
  return path.split(".")
    .reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
}

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type DotNestedKeys<T> = (T extends object ?
  { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
  : "") extends infer D ? Extract<D, string> : never;

export type ConfigKey = DotNestedKeys<Omit<Config, "config">>;
export class ConfigError extends Error {
  constructor(key: ConfigKey) {
    const msg = `${key} not set`;
    // const log = ExecutionContext.get().logger;
    // log.error(`ConfigError: ${msg}`);
    super(msg);
  }
}

