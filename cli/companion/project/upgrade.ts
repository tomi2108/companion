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

    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/67]: make this script also upgrade frontend deployments
    const filtered = deployments.filter((d) => !filterFrontendDeployments(d));

    for (let index = 0; index < filtered.length; index += 10) {
      const toDeploy = filtered.slice(index, index + 10);
      await Promise.all(
        toDeploy.map(
          async (d) => {
            const { deploy_repo, app_repo } = await getApp(d.name);
            if (!app_repo) return errors.push(`Could not find app repo for app ${d.name}, skipped`);
            if (!deploy_repo) return errors.push(`Could not find deploy repo for app ${d.name}, skipped`);
            const tags = await app_repo.getTags();
            // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/70]: this is only right for backend deployments
            // for frontend deployments we should look for -beta, -rc for different namespaces
            // find a good way to represent this in the config, this should be used in companion app status as well
            const last_version = tags[0];
            if (!last_version) return errors.push(`Could not find tag for app ${d.name}, skipped`);
            const namespace = project.name;
            if (last_version === deploy_repo.getDeployment(namespace)?.getVersion()) return;
            return await deploy_repo.deploy([{ name: namespace, configmaps: [], secrets: [] }], last_version);
          }
        )
      );
    }
    errors.forEach((e) => console.log(e));
  }
};
