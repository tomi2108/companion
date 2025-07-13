
import { getOcToken, Openshift } from "@interface/oc/oc";
import { promptForApp, promptForOcResource } from "@interface/prompts";
import log from "@lib/log";

export default {
  command: "copy",
  aliases: ["cp", "cpy"],
  describe: "Copy deployed environment to local repository",
  handler: async () => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const { app_repo: app } = await promptForApp();

    if (!app) {
      log.error("Could not find app, check the apps origin url");
      process.exit(1);
    }

    if (!app || !app.full_path) process.exit(1);

    await app.copyEnv(project);
    app.externalEnvs();
    log.success(`Copied envs for ${app.package} from namespace ${project.name}`);
  }
};
