import { getApp } from "../../../interface/files/files";
import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";
import chalk from "chalk";
import Table from "cli-table3";
import log from "../../../lib/log";
import { filterFrontendDeployments } from "../../../lib/utils";
import { loading } from "../../../lib/ui";

export default {
  command: "status",
  aliases: [],
  describe: "Show app status",
  handler: async () => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const deployments = (await project.getDeployments()).filter((e) => !filterFrontendDeployments(e));

    const table = new Table({
      head: ["App", "Current version", "Last version"],
      colWidths: [50]
    });

    const spinner = loading("Gathering status");
    for (let index = 0; index < deployments.length; index += 20) {
      const toProcess = deployments.slice(index, index + 20);
      await Promise.all(toProcess.map(async (deployment) => {
        const { app_repo, deploy_repo } = await getApp(deployment.name);
        if (!app_repo) {
          log.warning(`Could not find app repo for ${deployment.name}`);
          return;
        }
        if (!deploy_repo) {
          log.warning(`Could not find deploy repo for ${deployment.name}`);
          return;
        }
        const [last_version, current_version] = await Promise.all([
          (async () => {
            return (await app_repo.getTags())[0];
          })(),
          (async () => {
            await deploy_repo.update();
            const deployment_file = deploy_repo.getDeployment(project.name);
            if (!deployment_file) {
              log.warning(`Could not find deployment file for ${deployment.name} and namespace ${project.name}`);
              return;
            }
            return deployment_file.getVersion();
          })()
        ]);
        if (!last_version) return;
        const color = current_version === last_version ? "green" : "red";
        table.push([deployment.name, chalk[color](current_version), chalk[color](last_version)]);
      }));
    }
    spinner.succeed();
    console.log(table.sort((a, b) => (a as string[])[0].localeCompare((b as string[])[0])).toString());
  }
};
