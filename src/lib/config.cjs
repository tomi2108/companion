const path = require("node:path");
const fs = require("node:fs");
const { deepMerge, removePrefix, removeSuffix } = require("./utils.cjs");
const { input, password, search } = require("./ui.cjs");

const default_config = {
  jira: {
    labels: null
  },
  preferences: {
    logs_path: path.resolve(__dirname, "../../logs"),
    editor: process.env.EDITOR,
    browser: process.env.BROWSER
  }
};

// Some configs are not user configurable
let config = {
  global: {
    // TODO: may be not needed
    scripts_dir: path.resolve(__dirname, "../scripts"),
    configs_dir: path.resolve(__dirname, "../../configs"),
    oc_config_path: path.resolve(__dirname, "../../.configs/.kube/config"),
    oc_cache_path: path.resolve(__dirname, "../../.configs/.kube/cache"),
    glab_config_path: path.resolve(__dirname, "../../.configs/glab/")
  },
  openshift: {
    server_cuyo: "https://api.ocpnp.cuyorh.tcloud.ar:6443",
    server_barracas: "https://api.ocpnp.brcrh.tcloud.ar:6443"
  },
  gitlab: { server: "gitlab-ee.agil.movistar.com.ar" },
  jira: { server: "ar-telefonicahispam.atlassian.net" }
};

// export function configGet(key, c = config) {
//   const [entry, ...rest] = key.split(".");
//   const cfg = c[entry];
//   if (typeof cfg !== "object") return cfg;
//   return configGet(rest.join("."), cfg);
// }

config.loadConfig = function() {

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

  const config_file = path.resolve(__dirname, "../../config.json");
  const file_content = fs.readFileSync(config_file);
  const userConfig = JSON.parse(file_content);
  const readConfig = validateUserConfig(userConfig);
  config = deepMerge(config, default_config);
  if (isValidTeamKey(userConfig.team)) config = deepMerge(config, getTeamConfig(userConfig.team));
  config = deepMerge(config, readConfig);
};

function validateUserConfig(userConfig) {
  // TODO: validate userConfig and set anything that is valid into valid config
  const validConfig = {
    paths: {
      despliegues: userConfig.paths?.despliegues
    },
    openshift: {
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
    }
  };
  return validConfig;
}

function getAvailablePresets() {
  const files = fs.readdirSync(config.global.configs_dir)
    .filter((n) => !n.includes("example") && n.startsWith("config.") && n.endsWith("json"));
  return files.map((n) => removeSuffix(removePrefix(n, "config."), ".json"));
}

function getTeamConfig(key) {
  if (!isValidTeamKey(key)) process.exit(1);

  const config_file = path.resolve(__dirname, `../../configs/config.${key}.json`);
  const team_config = fs.readFileSync(config_file);
  return JSON.parse(team_config);
}

function isValidTeamKey(key) {
  if (!key) return;
  const keys = getAvailablePresets();
  return keys.includes(key);
}

config.setupConfig = async function() {
  // TODO: maybe link the docs in the message on how to obtain tokens ?
  const presets = getAvailablePresets();

  const preset = await search({
    message: "Select a preset or default config",
    choices: [...presets, "default"]
  });

  const oc_user = await input({ message: "Enter Openshift username" });
  const oc_token = await password({ message: "Enter Openshift auth token" });

  const glab_user = await input({ message: "Enter Gitlab username" });
  const glab_token = await password({ message: "Enter Gitlab auth token" });

  // TODO: find out if we need email or username...
  const jira_user = await input({ message: "Enter Jira username" });
  const jira_token = await password({ message: "Enter Jira auth token" });

  // TODO: write to our own config.json
  console.log({
    preset,
    openshift: {
      username: oc_user,
      token: oc_token
    },
    gitlab: {
      username: glab_user,
      token: glab_token
    },
    jira: {
      username: jira_user,
      token: jira_token
    }
  });
};

module.exports = config;
