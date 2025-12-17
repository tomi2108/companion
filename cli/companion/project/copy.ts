import { getApp } from "@files";
import { Gitlab } from "@glab";
import { promptChoice } from "@interface/prompts";
import { Config } from "@lib/config";
import log from "@lib/log/default";
import { arrayDifference } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "copy",
  aliases: ["cp"],
  describe: "Copy all missing apps from one project to another",
  handler: async () => {
    const glab = new Gitlab();
    const config = Config.get();
    const exclusions = config.project.copy?.exclusions ?? [];
    const projects = await new Openshift(await getOcToken()).getProjects();
    const from = await promptChoice(projects, { message: "Choose project to copy from" });
    const to = await promptChoice(projects, { message: "Choose project to copy to" });

    const from_deployments = await from.getDeployments();
    const to_deployments = await to.getDeployments();
    const difference = arrayDifference(from_deployments, to_deployments, (d1, d2) => d1.name === d2.name);
    if (difference.length === 0) {
      log.info("Project is already updated");
      return;
    }

    const errors: string[] = [];
    await Promise.all(
      difference
        .filter((d) => !exclusions.includes(d.name))
        .map(
          async (deployment) => {
            const { deploy_repo } = await getApp(deployment.name);
            if (!deploy_repo) return errors.push(`Could not find deploy repo for app ${deployment.name}, skipped`);
            const deploy_file = deploy_repo.getDeployment(from.name);
            if (!deploy_file) return errors.push(`Could not find deploy file for app ${deployment.name} and namespace ${from.name}, skipped`);
            const res = await glab.createArgoIssue(deployment.name, deploy_file.getVersion(), to);
            return res;
          }
        )
    );
    if (errors.length > 0) errors.forEach((e) => log.warning(e));
  }
};
