import { getApp } from "@interface/files/files";
import { Repo } from "@interface/files/repo";
import { getOcToken, Openshift } from "@interface/oc/oc";
import { promptForOcResource } from "@interface/prompts";
import { Config } from "@lib/config";
import log from "@lib/log";
import { input, loading, search } from "@lib/ui";
import { readdirs } from "@lib/utils";

export default {
  command: "create",
  aliases: ["c"],
  describe: "Create GitLab issues for app deployment",
  handler: async () => {
    const argocd_path = Config.get().paths.argocd;
    const ms_repos_path = Config.get().paths.backend;
    const mf_repos_path = Config.get().paths.frontend;

    if (!argocd_path) log.error("Argocd path not set in configuration");
    if (!ms_repos_path) log.error("Backend path not set in configuration");
    if (!mf_repos_path) log.error("Frontend path not set in configuration");
    if (!argocd_path || !ms_repos_path || !mf_repos_path) process.exit(1);

    const apps = [
      ...readdirs(mf_repos_path) ?? [],
      ...readdirs(ms_repos_path) ?? []
    ];

    const choices = apps.map((dir) => ({ name: dir.name }));
    const app = await search({ choices, message: "Select an app" });
    const { app_repo, deploy_repo } = await getApp(app);
    if (!app_repo) {
      log.error(`Could not find app repo for ${app}`);
      process.exit(1);
    }
    const exisingNamespaces = deploy_repo?.deployments.map((d) => d.namespace) ?? [];
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(
      projects.filter((p) => !exisingNamespaces.includes(p.name)),
      { message: "Select a project" });

    let version: string | null = null;
    if (app_repo) {
      const versions = loading("Getting versions");
      const tags = await app_repo.getTags();
      versions.succeed();
      version = await search({ choices: tags, message: "Select a version to create:" });
    } else {
      log.warning("Tags for repository not found");
      version = await input({ message: "Enter version to create, starting with a 'v':" });
    }

    const title = `${app}-${project.name}`;
    const description = `platform:openshift\r\nproject:${Config.get().openshift.project}\r\nnamespace:${project.name}\r\ndeployment:${app}\r\nversion:${version}`;

    const spinner = loading(`Creating issues for: ${app}`);
    await new Repo(argocd_path).createIssue({
      title,
      description
    });
    spinner.succeed();
  }
};
