import scan from "sonarqube-scanner";

import { Config } from "@lib/config";

import { SonarProject } from "./project";

export class SonarScanner {
  async scan(project: SonarProject) {
    const config = Config.getView();
    await scan(
      {
        serverUrl: config.get("sonar.server"),
        token: config.get("sonar.token"),
        options: {
          "sonar.login": config.get("sonar.token"),
          "sonar.projectKey": project.key,
          "sonar.projectName": project.key
        }
      },
      () => { });
  }
}
