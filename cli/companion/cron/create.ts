import path from "node:path";

import { getApp, getAppPaths } from "@files";
import { CronYaml } from "@files/cron_yaml";
import { Repo } from "@files/repo";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import { confirm, input, loading, search } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

export default {
  command: "create",
  aliases: [],
  describe: "Create CronJob from deployment",
  handler: async () => {
    const vault_path = Config.get().paths.vault;
    if (!vault_path) throw new ConfigError("paths.vault");

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const namespace = project.name;

    const name = await input({ message: "Cron job name:" });
    const schedule = await input({ message: "Cron job schedule:" });
    const paths = getAppPaths().filter((p) => p !== undefined).map((p) => path.basename(p));
    const app_name = await search({ message: "Choose app", choices: paths });
    const { app_repo } = await getApp(app_name);
    if (!app_repo) throw new Error("Could not find app repo");
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

    const repo_path = path.join(vault_path, project.name);
    const cron_file = path.join(repo_path, "templates", `${name}-cronjob.yaml`);
    const repo = new Repo(repo_path);
    await repo.stash(async () => {
      await repo.update();
      const { original_branch } = await repo.switchBranchIfExists("master");
      const temp_branch = `feature/add-cron-${name}`;
      await repo.createNewBranch(temp_branch);
      const file = CronYaml.create(cron_file);
      file.setVersion(version);
      file.setNameSpace(namespace);
      file.setDeployment(app_repo);
      secrets.forEach((s) => file.addSecret(s));
      configmaps.forEach((c) => file.addConfigmap(c));
      file.setName(name);
      file.setSchedule(schedule);
      file.save();
      await repo.add(cron_file);
      await repo.commit(name);
      await repo.createAndMergeMr("master");
      await repo.switchBranchIfExists("master");
      await repo.deleteBranch(temp_branch);
      await repo.switchBranchIfExists(original_branch);
    });
  }
};
