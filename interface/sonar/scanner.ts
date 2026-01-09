import scan from "sonarqube-scanner";

import { Config } from "@lib/config";

import { SonarProject } from "./project";

export class SonarScanner {
  async scan(project: SonarProject) {
    const config = Config.get();
    await scan(
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
  }
}
