import path from "node:path";
import fs from "node:fs";
import url from "node:url";
import { deepMerge } from "./utils.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Some configs are not user configurable
export const config = {
  paths: {
    // TODO: may be not needed
    scripts: path.resolve(__dirname, "../scripts")
  },
  global: {
    oc_config_path: path.resolve(__dirname, "../../.configs/.kube/config"),
    oc_cache_path: path.resolve(__dirname, "../../.configs/.kube/cache")
  },
  user: {
    oc: {
      cuyo: {
        server: "https://api.ocpnp.cuyorh.tcloud.ar:6443"
      }
    }
  }
};

// export function configGet(key, c = config) {
//   const [entry, ...rest] = key.split(".");
//   const cfg = c[entry];
//   if (typeof cfg !== "object") return cfg;
//   return configGet(rest.join("."), cfg);
// }

export function loadConfig() {

  // TODO: offer different locations for config file
  const config_file = path.resolve(__dirname, "../../config.json");
  const file_content = fs.readFileSync(config_file);
  // TODO: if no config is found prompt user to create a default one
  // ask for preset (teams preset maybe...)
  // or custom and ask for needed variables (tokens... etc) and set
  // sensible defaults, also print a message to where the config was created so the
  // user can change it if needed

  const { cfg, valid } = validateConfig(JSON.parse(file_content));
  // TODO: if not valid error or warning depending on severity

  // TODO: keep an eye on this... may cause problems with more complex
  // configs
  deepMerge(config, cfg);
}

function validateConfig(userConfig) {

  // TODO: validate userConfig and set anything
  // that is valid into valid config
  const validConfig = {
    user: {
      oc: {
        cuyo: {
          namespaces: userConfig.user.oc.cuyo.namespaces,
          token: userConfig.user.oc.cuyo.token
        }
      }
    }
  };

  // TODO: In the end, check if the resulting config is complete (has everything we need)
  // and return valid:true or valid:false
  return { cfg: validConfig, valid: true };
}
