
import { getApp, getAppPaths } from "@files";
import { CronYaml } from "@files/cron_yaml";
import { Dir } from "@files/dir";
import { Repo } from "@interface/dirs/repo";
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
    const namespaces_path = Config.get().paths.namespaces;
    if (!namespaces_path) throw new ConfigError("paths.namespaces");

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const namespace = project.name;

    const name = await input({ message: "Cron job name:" });
    const schedule = await input({ message: "Cron job schedule:" });
    const paths = getAppPaths().map((d) => d.toChoice());
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

    const repo_path = new Dir(namespaces_path).sub(project.name);
    const cron_file = repo_path.sub("templates").getFile(`${name}-cronjob.yaml`);
    const repo = new Repo(repo_path);
    await repo.stash(async () => {
      await repo.update();
      const { original_branch } = await repo.switchBranchIfExists("master");
      const temp_branch = `feature/add-cron-${name}`;
      await repo.createNewBranch(temp_branch);
      const file = CronYaml.create(cron_file.path);
      file.setVersion(version);
      file.setNameSpace(namespace);
      await file.setDeployment(app_repo);
      secrets.forEach((s) => file.addSecret(s));
      configmaps.forEach((c) => file.addConfigmap(c));
      file.setName(name);
      file.setSchedule(schedule);
      await repo.add(cron_file);
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
