import chalk from "chalk";
import Table from "cli-table3";
import SonarScanner from "sonarqube-scanner";

import { promptForApp } from "@interface/prompts";
import { SonarQube } from "@interface/sonar/api";
import { Config } from "@lib/config";
import log from "@lib/log";

const titles = {
  new_reliability_rating: "Reliability on new code",
  reliability_rating: "Reliability",
  new_maintainability_rating: "Maintainability on new code",
  sqale_rating: "Maintainability",
  duplicated_lines_density: "Duplicated lines",
  new_technical_debt: "Added technical debt"
};

export default {
  command: "scan",
  describe: "Run sonar scan",
  aliases: [],
  handler: async () => {
    const config = Config.get();
    const { app_repo } = await promptForApp();
    if (!app_repo) return;
    const { name } = await app_repo.getInfo();
    const full_path = app_repo.full_path;
    process.chdir(full_path);
    const sonar = new SonarQube();
    const projects = await sonar.getProjects();
    const project = projects.find((p) => p.key.includes(name));
    await SonarScanner(
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
    const quality_gates = await sonar.getQualityGates(project.key);
    const status = quality_gates.projectStatus.status;
    if (status === "OK") {
      log.success("Quality gates OK");
    } else {
      log.error("Quality gates ERROR");
    }

    console.log(quality_gates);
    const table = new Table({
      head: [name, "Limit", "", "Value"],
      style: { compact: true }
    });

    for (const qg of quality_gates.projectStatus.conditions) {
      const color = qg.status === "OK" ? chalk.green : chalk.red;
      table.push([
        titles[qg.metricKey as keyof typeof titles],
        color(qg.errorThreshold),
        color(">"),
        color(qg.actualValue)
      ]);
    }
    console.log(table.toString());
  }
};
