import { getApp } from "@files";
import { Dir } from "@files/dir";
import { Gitlab } from "@glab";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log";
import { input, loading, search } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "create",
  aliases: ["c"],
  describe: "Create GitLab issues for app deployment",
  handler: async () => {
    const argocd_path = Config.get().paths.argocd;
    const ms_repos_path = Config.get().paths.backend;
    const mf_repos_path = Config.get().paths.frontend;

    if (!argocd_path) throw new ConfigError("paths.argocd");
    if (!ms_repos_path) throw new ConfigError("paths.backend");
    if (!mf_repos_path) throw new ConfigError("paths.frontend");

    const apps = [
      ...new Dir(mf_repos_path).readDirs(),
      ...new Dir(ms_repos_path).readDirs()
    ];

    const choices = apps.map((d) => d.toChoice());
    const app = await search({ choices, message: "Select an app" });
    const { app_repo, deploy_repo } = await getApp(app);
    if (!app_repo) return log.error(`Could not find app repo for ${app}`);
    const existingNamespaces = deploy_repo?.deployments.map((d) => d.namespace) ?? [];
    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptForOcResource(
      projects.filter((p) => !existingNamespaces.includes(p.name)),
      { message: "Select a project" });

    let version: string | null = null;
    if (app_repo) {
      const versions = loading("Getting versions");
      await app_repo.update();
      const tags = await app_repo.getTags();
      versions.succeed();
      version = await search({ choices: tags, message: "Select a version to create:" });
    } else {
      log.warning("Tags for repository not found");
      version = await input({ message: "Enter version to create, starting with a 'v':" });
    }

    await new Gitlab().createArgoIssue(app, version, project);
  }
};
