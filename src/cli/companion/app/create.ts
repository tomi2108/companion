import { Config } from "../../../lib/config";
import log from "../../../lib/log";
import path from "node:path";
import { readdirs } from "../../../lib/utils";
import { input, loading, search } from "../../../lib/ui";
import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";
import { Repo } from "../../../interface/files/repo";
import { AppRepo } from "../../../interface/files/app_repo";
import { Dirent } from "node:fs";

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
    const dirent = apps.find((a) => a.name === app) as Dirent<string>;
    const app_repo = new AppRepo(path.join(dirent?.parentPath, dirent?.name));

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects, { message: "Select a project" });

    let version: string | null = null;
    if (app_repo) {
      const versions = loading("Getting versions");
      const tags = await app_repo.getTags();
      versions.succeed();
      version = await search({ choices: tags, message: "Select a version to create:" });
    } else {
      log.warning(`Tags for repository ${name} not found`);
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
