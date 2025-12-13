import { promptForApp, promptForOcResource } from "@interface/prompts";
import log from "@lib/log";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "copy",
  aliases: ["cp", "cpy"],
  describe: "Copy deployed environment to local repository",
  handler: async () => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const { app_repo: app } = await promptForApp();

    if (!app || !app.full_path) return log.error("Could not find app, check the apps origin url");
    const env = app.env_file;
    await env.copy(project, app);
    env.external();
    log.success(`Copied envs for ${app.package} from namespace ${project.name}`);
  }
};
