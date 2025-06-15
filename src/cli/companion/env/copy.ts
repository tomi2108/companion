import { externalEnvs } from "../../../interface/files/files";
import { getOcToken, Openshift } from "../../../interface/oc/oc";
import log from "../../../lib/log";
import path from "node:path";
import fs from "node:fs";
import { promptForApp, promptForOcResource } from "../../../interface/prompts";

export default {
  command: "copy",
  aliases: ["cp", "cpy"],
  describe: "Copy deployed environment to local repository",
  handler: async () => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const { app_repo: app } = await promptForApp();

    if (!app) {
      log.error("Could not find app, check the apps origin url");
      process.exit(1);
    }

    const { name } = await app.getInfo();
    if (!app.full_path) log.error(`Could not find path for ${name}, is the repository cloned?`);
    if (!app || !app.full_path) process.exit(1);

    const deployment = await project.getDeployment(name);

    const configMaps = await deployment.getConfigMaps() ?? [];
    const secrets = await deployment.getSecrets() ?? [];

    const env_file = path.join(app.full_path, ".env");
    if (fs.existsSync(env_file)) fs.rmSync(env_file);

    for (const r of [...secrets, ...configMaps]) {
      for (const [key, value] of Object.entries(await r.getData() ?? {})) {
        fs.appendFileSync(env_file, `${key}=${value}\n`);
      }
    }

    externalEnvs(env_file);
    log.success(`Copied envs for ${deployment.name} from namespace ${deployment.namespace}`);
  }
};
