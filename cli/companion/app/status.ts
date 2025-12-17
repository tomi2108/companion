import chalk from "chalk";
import Table from "cli-table3";

import { getApp } from "@files";
import { Dir } from "@files/dir";
import { AppRepo } from "@interface/dirs/app_repo";
import { promptChoice } from "@interface/prompts";
import { SonarQube } from "@interface/sonar";
import { Config } from "@lib/config";
import { loading } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "status",
  aliases: [],
  describe: "Show app status",
  handler: async () => {
    const sonar = new SonarQube();
    const sonar_projects = await sonar.getProjects();
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptChoice(projects);
    const fe = Config.get().paths.frontend;
    const be = Config.get().paths.backend;
    const apps = [
      ...fe ? new Dir(fe).readDirs() : [],
      ...be ? new Dir(be).readDirs() : []
    ];

    const table = new Table({
      style: {
        compact: true
      },
      head: [
        "App",
        "Current version",
        "Last version",
        "Updated",
        "Mocked",
        "TODOS"
      ]
    });

    const spinner = loading("Gathering status");
    for (let index = 0; index < apps.length; index += 20) {
      const toProcess = apps.slice(index, index + 20);
      await Promise.all(
        toProcess.map(async (dir) => {
          const app_repo = new AppRepo(dir);
          const info = await app_repo.getInfo();
          const deployment = await project.getDeployment(info.name).catch(() => null);
          const secrets = deployment?.getSecrets() ?? null;
          const [last, current] = await Promise.all([
            (async () => {
              // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/76]: for frontend repos look at -beta... -rc based on project
              await app_repo.update();
              return (await app_repo.getTags())?.[0];
            })(),
            (async () => {
              if (!deployment) return;
              const { deploy_repo } = await getApp(info.name);
              if (!deploy_repo) return;
              await deploy_repo.update();
              const deployment_file = deploy_repo.getDeployment(project.name);
              if (!deployment_file) return;
              return deployment_file.getVersion();
            })()
          ]);
          if (!last) return;

          const sonar_project = sonar_projects.find((p) => p.key.includes(info.name));
          const todos = (await sonar.getCodeSmells(sonar_project.key)).filter((i) => i.message.includes("TODO"));

          const isUpdated = current && last ? current === last : null;
          const color = isUpdated ? "green" : "red";
          const current_version = current ? chalk[color](current) : chalk.yellow("-");
          const last_version = last ? chalk[color](last) : chalk.yellow("-");
          const updated = (() => {
            if (isUpdated === null) return chalk.yellow("-");
            if (isUpdated) return chalk.green("yes");
            return chalk.red("no");
          })();

          const mockSecrets = Config.get().openshift.mock_secrets ?? [];

          const mocked = (() => {
            if (secrets === null) return chalk.yellow("-");
            if (secrets.some((s) => mockSecrets.includes(s.name))) return chalk.green("yes");
            return chalk.red("no");
          })();

          table.push([
            info.name,
            current_version,
            last_version,
            updated,
            mocked,
            todos.length
          ]);
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
