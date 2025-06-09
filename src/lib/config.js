import path from "node:path";
import fs from "node:fs";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export let config = {};

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

  config = cfg;
}

function validateConfig(readConfig) {
  // Some configs are not user configurable, this is why they are set
  // during the validation stage.

  // TODO: validate readConfig and set anything
  // that is valid into valid config
  const validConfig = {
    paths: {
      scripts: path.resolve(__dirname, "../scripts")
    },
    user: {
      oc: {
        cuyo: {
          server: "https://api.ocpnp.cuyorh.tcloud.ar:6443",
          token: readConfig.user.oc.cuyo.token
        }
      }
    }
  };

  // TODO: In the end, check if the resulting config is complete (has everything we need)
  // and return valid:true or valid:false
  return { cfg: validConfig, valid: true };
}
