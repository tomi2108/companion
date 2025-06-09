const path = require("node:path");
const fs = require("node:fs");
const { deepMerge } = require("./utils.cjs");
const Enquirer = require("enquirer");

const { password, select } = Enquirer;

const default_config = {
  preferences: {
    logs_path: path.resolve(__dirname, "../../logs"),
    editor: process.env.EDITOR,
    browser: process.env.BROWSER
  }
};

// Some configs are not user configurable
let config = {
  paths: {
    // TODO: may be not needed
    scripts: path.resolve(__dirname, "../scripts")
  },
  global: {
    oc_config_path: path.resolve(__dirname, "../../.configs/.kube/config"),
    oc_cache_path: path.resolve(__dirname, "../../.configs/.kube/cache"),
    glab_config_path: path.resolve(__dirname, "../../.configs/glab/")
  },
  user: {
    oc: {
      cuyo: {
        server: "https://api.ocpnp.cuyorh.tcloud.ar:6443"
      }
    },
    glab: {
      server: "gitlab-ee.agil.movistar.com.ar"
    }
  }
};

// export function configGet(key, c = config) {
//   const [entry, ...rest] = key.split(".");
//   const cfg = c[entry];
//   if (typeof cfg !== "object") return cfg;
//   return configGet(rest.join("."), cfg);
// }

config.loadConfig = function() {

  // TODO: offer different locations for config file ... ? may be we dont really need this
  const config_file = path.resolve(__dirname, "../../config.json");
  const file_content = fs.readFileSync(config_file);
  // TODO: if file is not found, ask the user if he wants to run the interactive config setup
  // and run setupConfig() after setup we should exit, and the next time companion is run
  // config should exist and setup will be skipped

  // TODO: if file exists, but is not valid
  // log error(s) or warning(s) depending on severity
  const { cfg: read_config, valid } = validateConfig(JSON.parse(file_content));

  // TODO: keep an eye on this... may cause problems with more complex configs
  config = deepMerge(config, read_config);
  // TODO: once we have a full and complete companion config.json
  // write them to the .configs for each program check setup() from ./setup.js
  // loadConfig() and setup() should be run every time companion runs overriding programs
  // config with our config.json values
};

function validateConfig(userConfig) {
  // TODO: validate userConfig and set anything
  // that is valid into valid config
  // anything that the user does not specify should be
  // filled in with sensible defaults here found in default_config
  const validConfig = {
    paths: {
      oc: userConfig.paths.oc
    },
    user: {
      oc: {
        cuyo: {
          username: userConfig.user.oc.cuyo.username,
          password: userConfig.user.oc.cuyo.password
        }
      },
      gitlab: {
        username: userConfig.user.gitlab.username,
        token: userConfig.user.gitlab.token
      }
    },
    preferences: {
      logs_path: userConfig.preferences.logs_path,
      editor: userConfig.preferences.editor,
      browser: userConfig.preferences.browser
    }
  };

  // TODO: In the end, check if the resulting config is complete (has everything we need)
  // and return valid:true or valid:false
  // if a critical config is missing eg. glabs_token
  // we should return valid:false
  return { cfg: deepMerge(default_config, validConfig), valid: true };
}

config.setupConfig = async function() {
  // TODO: get presets
  const presets = ["movistar-empresas", "R.E.B.O", "SoySetm", "Estructurales"];

  const preset = await select({
    message: "Select a preset or default config",
    choices: [...presets, "default"].map((s) => ({ name: s, value: s }))
  });

  // TODO: maybe link the docs in the message on how to obtain them ?
  const oc_token = await password({
    message: "Enter Openshift auth token",
    mask: true
  });

  const glab_token = await password({
    message: "Enter Gitlab auth token",
    mask: true
  });

  const jira_token = await password({
    message: "Enter Jira auth token",
    mask: true
  });

  // TODO: write to our own config.json
  console.log({ preset, oc_token, glab_token, jira_token });
};

module.exports = config;
