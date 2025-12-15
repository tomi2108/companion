import chalk from "chalk";
import Table from "cli-table3";
import SonarScanner from "sonarqube-scanner";
import { Argv } from "yargs";

import { promptForApp } from "@interface/prompts";
import { SonarQube } from "@interface/sonar";
import { Config } from "@lib/config";
import { openInBrowser } from "@lib/editor";
import { confirm } from "@lib/ui";

const comparators = {
  GT: "<",
  LT: ">"
};
const titles = {
  new_reliability_rating: "Reliability on new code",
  reliability_rating: "Reliability",
  new_maintainability_rating: "Maintainability on new code",
  sqale_rating: "Maintainability",
  duplicated_lines_density: "Duplicated lines",
  new_duplicated_lines_density: "Duplicated lines on new code",
  new_technical_debt: "Added technical debt",
  new_coverage: "Coverage on new code"
};

export default {
  command: "scan",
  describe: "Run sonar scan",
  aliases: [],
  builder: (yargs: Argv) => yargs
    .boolean("no-scan")
    .alias("no-scan", ["ns"])
    .describe("no-scan", "Skip running remote scan and only show report"),
  handler: async (args: { "no-scan"?: boolean }) => {
    const config = Config.get();
    const no_scan = args["no-scan"];
    const { app_repo } = await promptForApp();
    if (!app_repo) return;
    const { name } = await app_repo.getInfo();
    process.chdir(app_repo.dir.path);
    const sonar = new SonarQube();
    const projects = await sonar.getProjects();
    const project = projects.find((p) => p.key.includes(name));
    if (!no_scan) await SonarScanner(
      {
        serverUrl: config.sonar.server,
        token: config.sonar.token,
        options: {
          "sonar.login": config.sonar.token,
          "sonar.projectKey": project.key,
          "sonar.projectName": project.key
        }
      },
      () => { });

    const [
      code_smells,
      hotspots,
      quality_gates
    ]
      = await Promise.all([
        sonar.getCodeSmells(project.key),
        sonar.getHotspots(project.key),
        sonar.getQualityGates(project.key)
      ]);

    const table = new Table({
      head: [name, "Value", "", "Limit"],
      style: { compact: true }
    });

    for (const qg of quality_gates.conditions) {
      const color = qg.status === "OK" ? chalk.green : chalk.red;
      table.push([
        titles[qg.metricKey as keyof typeof titles],
        color(qg.actualValue),
        color(comparators[qg.comparator as keyof typeof comparators]),
        color(qg.errorThreshold)
      ]);
    }

    const second_table = new Table({
      head: [name, "Value"],
      style: { compact: true }
    });

    const iterate = [
      { title: "Total code smells", arr: code_smells },
      { title: "Total security hotspots", arr: hotspots }
    ];

    for (const { title, arr } of iterate) {
      const color = arr.length === 0 ? chalk.green : chalk.red;
      second_table.push([
        title,
        color(arr.length)
      ]);

    }
    console.log(table.toString());
    console.log(second_table.toString());
    const open = await confirm({ message: "Open report in browser?" });
    if (open) openInBrowser(`${config.sonar.server}/dashboard?id=${project.key}`);
  }
};
