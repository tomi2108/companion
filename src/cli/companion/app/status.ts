import { getApp } from "../../../interface/files/files";
import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";
import chalk from "chalk";
import Table from "cli-table3";
import log from "../../../lib/log";
import { loading } from "../../../lib/ui";
import { Config } from "../../../lib/config";

export default {
  command: "status",
  aliases: [],
  describe: "Show app status",
  handler: async () => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const deployments = await project.getDeployments();

    const table = new Table({
      head: ["App", "Current version", "Last version", "Mocked"],
      colWidths: [50]
    });

    const spinner = loading("Gathering status");
    for (let index = 0; index < deployments.length; index += 20) {
      const toProcess = deployments.slice(index, index + 20);
      await Promise.all(toProcess.map(async (deployment) => {
        const secrets = deployment.getSecrets() ?? [];
        const { app_repo, deploy_repo } = await getApp(deployment.name);
        if (!app_repo) {
          log.warning(`Could not find app repo for ${deployment.name}`);
          return;
        }
        if (!deploy_repo) {
          log.warning(`Could not find deploy repo for ${deployment.name}`);
          return;
        }
        const [last, current] = await Promise.all([
          (async () => {
            // TODO: for frontend repos look at -beta... -rc based on project
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
        if (!last) return;
        const color = current === last ? "green" : "red";
        const current_version = chalk[color](current);
        const last_version = chalk[color](last);
        const mockSecrets = Config.get().openshift.mock_secrets ?? [];
        const mocked = secrets.some((s) => mockSecrets.includes(s.name)) ? chalk.green("yes") : chalk.red("no");
        table.push([deployment.name, current_version, last_version, mocked]);
      }));
    }
    spinner.succeed();
    const sortedTable = table.sort((a, b) => {
      const nameA = Array.isArray(a) && typeof a[0] === "string" ? a[0] : "";
      const nameB = Array.isArray(b) && typeof b[0] === "string" ? b[0] : "";
      return nameA.localeCompare(nameB);
    });
    console.log(sortedTable.toString());
  }
};
