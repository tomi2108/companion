import path from "node:path";
import fs from "node:fs";
import { deepMerge, removePrefix, removeSuffix } from "./utils";
import { input, password, search, confirm } from "./ui";
import log from "./log";
import { MsType } from "./constants";

const config_file = path.resolve(__dirname, "../../config.json");

// Properties here should be optional if and only if
// we cannot guarantee they are there, when:
// they are not required in personal config
// they are not required in team config
// they are not set by default
type GitlabConfig = {
  server: string;
  token: string;
  username: string;
  repos: { [K in keyof PathsConfig]?: number };
};

type JiraConfig = {
  server: string;
  token: string;
  username: string;
  labels: string[];
  project_key: string;
  board_id: number;
};

type OpenShiftConfig = {
  server_cuyo: string;
  server_barracas: string;
  password: string;
  username: string;
  default_ms_type?: MsType;
  namespace_prefix?: string;
  project?: string;
  product: string;
  // TODO : type this
  deployments: any;
};

type PreferencesConfig = {
  logs_path: string;
  editor: string;
  browser: string;
};

type PathsConfig = {
  despliegues?: string;
  frontend?: string;
  backend?: string;
  "3scale"?: string;
  argocd?: string;
  vault?: string;
};

type DynatraceConfig = {
  modulo?: string;
};

class Config {
  static config: Config | null = null;
  global = {
    scripts_dir: path.resolve(__dirname, "../scripts"),
    configs_dir: path.resolve(__dirname, "../../configs"),
    tmp_dir: path.resolve(__dirname, "../../tmp"),
    oc_config_path: path.resolve(__dirname, "../../.configs/.kube/config"),
    oc_cache_path: path.resolve(__dirname, "../../.configs/.kube/cache"),
    glab_config_path: path.resolve(__dirname, "../../.configs/glab/")
  };

  openshift: OpenShiftConfig = {
    server_cuyo: "https://api.ocpnp.cuyorh.tcloud.ar:6443",
    server_barracas: "https://api.ocpnp.brcrh.tcloud.ar:6443"
  } as OpenShiftConfig;

  gitlab: GitlabConfig = { server: "https://gitlab-ee.agil.movistar.com.ar" } as GitlabConfig;

  jira: JiraConfig = {
    server: "ar-telefonicahispam.atlassian.net",
    labels: [] as string[]
  } as JiraConfig;

  preferences: PreferencesConfig = {
    logs_path: path.resolve(__dirname, "../../logs"),
    editor: process.env.EDITOR ?? "vi",
    browser: process.env.BROWSER ?? "firefox"
  };

  paths: PathsConfig = {} as PathsConfig;
  dynatrace: DynatraceConfig = {} as DynatraceConfig;

  static get() {
    if (this.config === null) this.config = new Config();
    return this.config;
  }

  private constructor() { }

  async setup() {
    // TODO: maybe link the docs in the message on how to obtain tokens ?
    const presets = this.getAvailablePresets();

    const preset = await search({
      message: "Select a preset or default config",
      choices: [...presets, "default"]
    });

    const oc_user = await input({ message: "Enter Openshift username" });
    const oc_password = await password({ message: "Enter Openshift auth token" });

    const glab_user = await input({ message: "Enter Gitlab username" });
    const glab_token = await password({ message: "Enter Gitlab auth token" });

    // TODO: find out if we need email or username...
    const jira_user = await input({ message: "Enter Jira username" });
    const jira_token = await password({ message: "Enter Jira auth token" });

    const config_to_write = {
      team: preset !== "default" ? preset : null,
      openshift: {
        username: oc_user,
        password: oc_password
      },
      gitlab: {
        username: glab_user,
        token: glab_token
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
    // TODO: offer different locations for config file ... ? may be we dont really need this
    // TODO: if file is not found, ask the user if he wants to run the interactive config setup
    // and run setupConfig() after setup we should exit, and the next time companion is run
    // config should exist and setup will be skipped
    // TODO: if file exists, but is not valid
    // log error(s) or warning(s) depending on severity
    // TODO: once we have a full and complete companion config.json
    // write them to the .configs for each program check setup() from ./setup.js
    // loadConfig() and setup() should be run every time companion runs overriding programs
    // config with our config.json values

    let file_content = "";
    try {
      file_content = fs.readFileSync(config_file).toString();
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
        log.warning("Configuration file config.json for Companion was not found");
        const setup = await confirm({ message: "Would you like to setup a config interactively?" });
        if (setup) {
          await this.setup();
          // TODO: I dont think this is working :?  try  running companion setup config without a config.json
          // and after writing the config ENOENT is thrown for some reason
          file_content = fs.readFileSync(config_file).toString();
        }
      }
      throw err;
    }

    // TODO: validate and type here team config
    const readConfig = JSON.parse(file_content);
    const userConfig = this.validateUserConfig(readConfig);
    // TODO: probably validate each config (gitlab, jira... etc) separately
    // and merge them with defaults
    if (this.isValidTeamKey(readConfig.team)) {
      this.jira = deepMerge(this.jira, this.getTeamConfig(readConfig.team).jira);
      this.gitlab = deepMerge(this.gitlab, this.getTeamConfig(readConfig.team).gitlab);
      this.openshift = deepMerge(this.openshift, this.getTeamConfig(readConfig.team).openshift);
      this.dynatrace = deepMerge(this.dynatrace, this.getTeamConfig(readConfig.team).dynatrace);
    }
    // TODO: find a better way to do this... integrate zod probably
    // https://zod.dev/
    this.jira = deepMerge(this.jira, userConfig.jira);
    this.gitlab = deepMerge(this.gitlab, userConfig.gitlab);
    this.openshift = deepMerge(this.openshift, userConfig.openshift);
  }

  validateUserConfig(userConfig: any) {
    // TODO: validate userConfig and set anything that is valid into valid config
    const validConfig = {
      paths: {
        despliegues: userConfig.paths?.despliegues,
        frontend: userConfig.paths?.frontend,
        backend: userConfig.paths?.backend,
        "3scale": userConfig.paths?.["3scale"],
        argocd: userConfig.paths?.argocd,
        vault: userConfig.paths?.vault
      },
      openshift: {
        namespace_prefix: userConfig.openshift?.namespace_prefix,
        default_ms_type: userConfig.openshift?.default_ms_type,
        project: userConfig.openshift?.project,
        product: userConfig.openshift?.product,
        deployments: userConfig.openshift?.deployments,
        username: userConfig.openshift?.username,
        password: userConfig.openshift?.password
      },
      gitlab: {
        username: userConfig.gitlab?.username,
        token: userConfig.gitlab?.token
      },
      jira: {
        project_key: userConfig.jira?.project_key,
        username: userConfig.jira?.username,
        token: userConfig.jira?.token,
        labels: userConfig.jira?.labels
      },
      preferences: {
        logs_path: userConfig.preferences?.logs_path,
        editor: userConfig.preferences?.editor,
        browser: userConfig.preferences?.browser
      },
      dynatrace: {
        modulo: userConfig.dynatrace?.modulo
      }
    };
    return validConfig;
  }

  private getAvailablePresets() {
    const files = fs.readdirSync(this.global.configs_dir)
      .filter((n) => !n.includes("example") && n.startsWith("config.") && n.endsWith("json"));
    return files.map((n) => removeSuffix(removePrefix(n, "config."), ".json"));
  }

  private isValidTeamKey(key: string) {
    if (!key) return;
    const keys = this.getAvailablePresets();
    return keys.includes(key);
  }

  private getTeamConfig(key: string) {
    const team_config_file = path.resolve(__dirname, `../../configs/config.${key}.json`);
    const team_config = fs.readFileSync(team_config_file).toString();
    return JSON.parse(team_config);
  }

}

export { Config };
