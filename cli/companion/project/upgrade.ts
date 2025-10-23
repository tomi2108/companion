import { getApp } from "@files";
import { promptForOcResource } from "@interface/prompts";
import { Openshift } from "@oc";
import { filterFrontendDeployments, getOcToken } from "@oc/api";

export default {
  command: "upgrade",
  aliases: ["up"],
  describe: "Upgrade all apps to the latest version in a project",
  handler: async () => {
    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptForOcResource(projects, { message: "Choose project to upgrade" });

    const deployments = await project.getDeployments();

    const errors: string[] = [];
    await Promise.all(
      deployments
        // TODO: make this script also upgrade frontend deployments
        .filter((d) => !filterFrontendDeployments(d))
        .map(
          async (d) => {
            const { deploy_repo, app_repo } = await getApp(d.name);
            if (!app_repo) return errors.push(`Could not find app repo for app ${d.name}, skipped`);
            if (!deploy_repo) return errors.push(`Could not find deploy repo for app ${d.name}, skipped`);
            const tags = await app_repo.getTags();
            // TODO: this is only right for backend deployments
            // for frontend deployments we should look for -beta, -rc for different namespaces
            // find a good way to represent this in the config, this should be used in companion app status as well
            const last_version = tags[0];
            if (!last_version) return errors.push(`Could not find tag for app ${d.name}, skipped`);
            return await deploy_repo.deploy([{ name: project.name, configmaps: [], secrets: [] }], last_version);
          }
        )
    );
  }
};
