import { getOcToken, Openshift } from "../../../interface/oc/oc";
import log from "../../../lib/log";
import path from "node:path";
import fs from "node:fs";
import { promptForOcResource } from "../../../interface/prompts";
import { Argv } from "yargs";
import { getApp } from "../../../interface/files/files";

export default {
  command: "health",
  aliases: ["h"],
  describe: "Detect missing envs in deployment",
  builder: (yargs: Argv) => yargs
    .boolean("all")
    .alias("all", ["a"])
    .describe("all", "Whether to run the script for all all repositories"),
  handler: async ({ all }: { all?: boolean }) => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    let deployments = (await project.getDeployments()).filter((e) => !e.name.startsWith("app-"));

    if (!all) {
      const deployment = await promptForOcResource(deployments);
      deployments = [deployment];
    }

    for (const deployment of deployments) {
      const { app_repo: app } = await getApp(deployment.name);
      if (!app || !app.full_path) {
        log.error(`Could not find app for ${deployment.name}`);
        continue;
      }

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
  }
};
