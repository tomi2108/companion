import chalk from "chalk";
import Table from "cli-table3";
import fs from "node:fs";
import path from "node:path";
import { Argv } from "yargs";

import { getApp } from "@files";
import { promptForOcResource } from "@interface/prompts";
import { Config } from "@lib/config";
import log from "@lib/log";
import { Openshift } from "@oc";
import { filterFrontendDeployments, getOcToken } from "@oc/api";

const status = {
  UNUSED: "unused",
  MISSING: "missing"
} as const;

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
    let deployments = (await project.getDeployments()).filter((e) => !filterFrontendDeployments(e));

    if (!all) {
      const deployment = await promptForOcResource(deployments);
      deployments = [deployment];
    }

    for (const deployment of deployments) {
      const { app_repo: app, deploy_repo } = await getApp(deployment.name);
      const deployment_file = deploy_repo?.getDeployment(project.name);
      const version = deployment_file?.getVersion();

      if (!app || !app.full_path) log.warning(`Could not find app for ${deployment.name}`);
      if (!deploy_repo || !version || !deployment_file) log.warning(`Could not find version for ${deployment.name}`);
      if (!app || !app.full_path || !deploy_repo || !version || !deployment_file) continue;
      const active_branch = await app.getActiveBranch();
      await app.checkout(version);

      const env_path = Config.get().repos.environment_path ?? "src/configuration/environment.ts";
      const env_full_path = path.join(app.full_path, env_path);
      if (!fs.existsSync(env_full_path)) {
        log.warning(`Could not find env file for ${deployment.name}`);
        continue;
      }

      const configMaps = await deployment.getConfigMaps() ?? [];
      const secrets = deployment.getSecrets() ?? [];
      const resources = await Promise.all([...secrets, ...configMaps].map((r) => r.getData()));
      const env = resources.filter((r) => r !== undefined).reduce((acc, curr) => ({ ...acc, ...curr }));
      const needed_envs = fs.readFileSync(env_full_path).toString().trim();
      const matches = needed_envs.matchAll(/process\.env\..*/g).toArray().map((m) => m[0].replace("process.env.", ""));
      const envs_exclusions = Config.get().envs.health_exclusions ?? [];
      const keys = matches
        .map((m) => m.split(" ")?.[0]?.replaceAll(",", "") ?? "")
        .filter((k) => !envs_exclusions.includes(k));

      const missing = new Table({
        head: [deployment.name, "Status"],
        style: { compact: true },
        colWidths: [50]
      });

      for (const key of keys) {
        if (!env[key]) missing.push([key, chalk.red(status.MISSING)]);
      }

      for (const key of Object.keys(env).filter((k) => !envs_exclusions.includes(k))) {
        if (!keys.includes(key)) missing.push([key, chalk.yellow(status.UNUSED)]);
      }

      app.switchBranchIfExists(active_branch);

      if (missing.length > 0) console.log(missing.toString());
    }
  }
};
