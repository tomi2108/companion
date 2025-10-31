import SonarScanner from "sonarqube-scanner";

import { promptForApp } from "@interface/prompts";
import { SonarQube } from "@interface/sonar/api";
import { Config } from "@lib/config";
import log from "@lib/log";

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
      console.log(quality_gates.projectStatus.conditions.filter((c: { status: string }) => c.status !== "OK"));
    }
  }
};
