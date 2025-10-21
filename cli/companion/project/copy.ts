import { getApp } from "@files";
import { Gitlab } from "@glab";
import { promptForOcResource } from "@interface/prompts";
import { arrayDifference } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "copy",
  aliases: ["cp"],
  describe: "Copy all missing apps from one project to another",
  handler: async () => {
    const glab = new Gitlab();
    const projects = await new Openshift(await getOcToken()).getProjects();
    const from = await promptForOcResource(projects, { message: "Choose project to copy from" });
    const to = await promptForOcResource(projects, { message: "Choose project to copy to" });

    const from_deployments = await from.getDeployments();
    const to_deployments = await to.getDeployments();
    const difference = arrayDifference(from_deployments, to_deployments, (d1, d2) => d1.name === d2.name);

    const errors: string[] = [];
    await Promise.all(
      difference.map(
        async (deployment) => {
          const { deploy_repo } = await getApp(deployment.name);
          if (!deploy_repo) return errors.push(`Could not find deploy repo for app ${deployment}, skipped`);
          const deploy_file = deploy_repo.getDeployment(from.name);
          if (!deploy_file) return errors.push(`Could not find deploy file for app ${deployment} and namespace ${from.name}, skipped`);
          const res = await glab.createArgoIssue(deployment.name, deploy_file.getVersion(), to);
          return res;
        }
      )
    );
    if (errors.length > 0) errors.forEach((e) => console.log(e));
  }
};
