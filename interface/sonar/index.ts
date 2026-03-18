import axios, { AxiosInstance } from "axios";

import { Config, ConfigError } from "@lib/config";

import { SonarProject, SonarProjectRes } from "./project";
import { iterateEndpoint } from "./utils";

export class SonarQube {
  private sonar: AxiosInstance;

  constructor() {
    const server = Config.getView().get("sonar.server");
    const token = Config.getView().get("sonar.token");
    if (!server) throw new ConfigError("sonar.server");
    if (!token) throw new ConfigError("sonar.token");

    this.sonar = axios.create({
      baseURL: server,
      auth: {
        username: token,
        password: ""
      }
    });
  }

  async getProjects() {
    const res = await iterateEndpoint<SonarProjectRes>(
      this.sonar,
      "/api/components/search_projects",
      "components"
    );
    return res.map(SonarProject.fromProjectRes);
  }
}
