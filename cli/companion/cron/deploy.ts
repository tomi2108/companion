import fs from "node:fs";
import path from "node:path";

import { getApp } from "@files";
import { CronYaml } from "@files/cron_yaml";
import { Repo } from "@interface/dirs/repo";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import { confirm, input, loading, search } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

export default {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy CronJob new version",
  handler: async () => {
    const vault_path = Config.get().paths.vault;
    if (!vault_path) throw new ConfigError("paths.vault");

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const namespace = project.name;
    const repo_path = path.join(vault_path, namespace);
    const templates_path = path.join(repo_path, "templates");
    const cron_jobs = fs.readdirSync(templates_path, { withFileTypes: true }).filter(CronYaml.isCronYaml).map((d) => d.name);
    const selected_cron = await search({ message: "Select cronjob", choices: cron_jobs });
    const cron_job = path.join(templates_path, selected_cron);
    const file = new CronYaml(cron_job);
    const name = file.getName();
    const schedule = await input({ message: "Cron job schedule:", initial: file.getSchedule() });
    const app_name = file.getAppName();
    if (!app_name) throw new Error(`Could not find app name in cron yaml ${file.file_path}`);
    const { app_repo } = await getApp(app_name);
    if (!app_repo) throw new Error(`Could not find app repo for app ${app_name}`);
    const versionsSpinner = loading("Getting versions");
    const tags = await app_repo.getTags();
    versionsSpinner.succeed();
    const version = await search({ choices: tags, message: "Choose a version to deploy:" });

    const addsSecrets = await confirm({ message: `Add secrets to the cron job? (${namespace})`, initial: false });
    let secrets: Secret[] = [];
    let configmaps: ConfigMap[] = [];

    if (addsSecrets) {
      const project = await new Openshift(token as string).getProject(namespace);
      const secrets_available = await project.getSecrets();
      secrets = await promptForOcResource(secrets_available, { message: "Select secrets", multiple: true });
    }

    const addsConfigmaps = await confirm({ message: `Add configmaps to the cron job? (${namespace})`, initial: false });
    if (addsConfigmaps) {
      const tokenn = token ?? await getOcToken();
      const project = await new Openshift(tokenn).getProject(namespace);
      const configmaps_availabie = await project.getConfigMaps();
      configmaps = await promptForOcResource(configmaps_availabie, { message: "Select configmaps", multiple: true });
    }

    const repo = new Repo(repo_path);
    await repo.stash(async () => {
      await repo.update();
      const { original_branch } = await repo.switchBranchIfExists("master");
      const temp_branch = `feature/update-cron-${name}`;
      await repo.createNewBranch(temp_branch);
      file.setVersion(version);
      secrets.forEach((s) => file.addSecret(s));
      configmaps.forEach((c) => file.addConfigmap(c));
      file.setSchedule(schedule);
      file.save();
      await repo.add(file.file_path);
      const commit = await repo.commit(name);
      if (!commit) {
        console.log("No changes made");
        return;
      }
      await repo.createAndMergeMr("master");
      await repo.switchBranchIfExists("master");
      await repo.deleteBranch(temp_branch);
      await repo.switchBranchIfExists(original_branch);
    });
  }
};
