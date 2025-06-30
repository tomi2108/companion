import { getOcToken, Openshift } from "../../../interface/oc/oc";
import log from "../../../lib/log";
import path from "node:path";
import fs from "node:fs";
import { promptForApp, promptForOcResource } from "../../../interface/prompts";

export default {
  command: "health",
  aliases: ["h"],
  describe: "Detect missing envs in deployment",
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
    const secrets = deployment.getSecrets() ?? [];
    const resources = await Promise.all([...secrets, ...configMaps].map((r) => r.getData()));
    const env = resources.filter((r) => r !== undefined).reduce((acc, curr) => ({ ...acc, ...curr }));
    // TODO : probably make file a team config
    const needed_envs = fs.readFileSync(path.join(app.full_path, "src/configuration/environment.ts")).toString().trim();
    const matches = needed_envs.matchAll(/process\.env\..*/g).toArray().map((m) => m[0].replace("process.env.", ""));
    const keys = matches.map((m) => m.split(" ")[0].replaceAll(",", ""));

    for (const key of keys) {
      if (!env[key]) log.error(`Missing ${key} in ${deployment.name} in ${deployment.namespace}`);
    }

  }
};
