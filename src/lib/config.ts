import path from "node:path";
import fs from "node:fs";
import { deepMerge, removePrefix, removeSuffix } from "./utils";
import { input, password, search, confirm } from "./ui";
import log from "./log";
import { ConfigSchema, DynatraceConfig, GitlabConfig, JiraConfig, OpenShiftConfig, PathsConfig, PreferencesConfig, VaultConfig } from "./validations";

const config_file = path.resolve(__dirname, "../../config.json");

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
    auth_server_cuyo: "https://oauth-openshift.apps.ocpnp.cuyorh.tcloud.ar",
    auth_server_barracas: "https://oauth-openshift.apps.ocpnp.brcrh.tcloud.ar",
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

  vault: VaultConfig = {
    server: "https://vault.agil.movistar.com.ar"
  } as VaultConfig;

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
    const oc_cuyo_token = await password({ message: "Enter Openshift CUYO token" });
    const oc_barracas_token = await password({ message: "Enter Openshift BARRACAS token" });

    const glab_user = await input({ message: "Enter Gitlab username" });
    const glab_token = await password({ message: "Enter Gitlab auth token" });

    // TODO: find out if we need email or username...
    const jira_user = await input({ message: "Enter Jira username" });
    const jira_token = await password({ message: "Enter Jira auth token (https://id.atlassian.com/manage-profile/security/api-tokens)" });

    // TODO: find out if we need email or username...
    const vault_token = await password({ message: "Enter Vault auth token" });

    const config_to_write = {
      team: preset !== "default" ? preset : null,
      openshift: {
        username: oc_user,
        token_cuyo: oc_cuyo_token,
        token_barracas: oc_barracas_token
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

    const readConfig = ConfigSchema.parse(JSON.parse(file_content));
    (["jira", "gitlab", "openshift", "vault", "dynatrace", "paths", "preferences"] as const).forEach((key) => {
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

export { Config };
