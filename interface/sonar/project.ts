import axios, { AxiosInstance } from "axios";
import SonarQubeClient, { Issue } from "sonarqube-web-api-client";

import { Config, ConfigError } from "@lib/config";
import { openInBrowser } from "@lib/editor";

import { iterateEndpoint } from "./utils";

type QualityGate = {
  metricKey: string;
  actualValue: string;
  comparator: string;
  errorThreshold: string;
  status: string;
};

export type SonarProjectRes = {
  key: string;
};

export class SonarProject {
  private client;
  private sonar: AxiosInstance;

  static fromProjectRes(res: SonarProjectRes) {
    return new SonarProject(res.key);
  }

  constructor(
    public key: string
  ) {
    const server = Config.get().sonar.server;
    const token = Config.get().sonar.token;
    if (!server) throw new ConfigError("sonar.server");
    if (!token) throw new ConfigError("sonar.token");

    this.client = SonarQubeClient.withBasicAuth(server, token);
    this.sonar = axios.create({ baseURL: server, auth: { username: token, password: "" } });
  }

  async getHotspots() {
    return iterateEndpoint(this.sonar, "/api/hotspots/search", "hotspots", {
      projectKey: this.key,
      status: "TO_REVIEW",
      onlyMine: false,
      inNewCodePeriod: false
    });
  }

  async getQualityGates() {
    const params = { projectKey: this.key };
    const res = await this.sonar
      .get<{ projectStatus: { conditions: QualityGate[] } }>(
        "/api/qualitygates/project_status",
        { params }
      );
    return res.data.projectStatus.conditions;
  }

  async getCodeSmells() {
    const iterator = this.client.issues
      .search()
      .componentKeys([this.key])
      .onlyUnresolved()
      .withTypes(["CODE_SMELL"])
      .all();
    const res: Issue[] = [];
    for await (const issue of iterator) {
      res.push(issue);
    }
    return res;
  }

  openInBrowser() {
    const config = Config.get();
    openInBrowser(`${config.sonar.server}/dashboard?id=${this.key}`);
  }
}
