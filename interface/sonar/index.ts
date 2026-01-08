import axios, { AxiosInstance } from "axios";
import SonarQubeClient, { Issue } from "sonarqube-web-api-client";

import { Config, ConfigError } from "@lib/config";

export class SonarQube {

  private sonar: AxiosInstance;
  private client;

  constructor() {
    const server = Config.get().sonar.server;
    const token = Config.get().sonar.token;
    if (!server) throw new ConfigError("sonar.server");
    if (!token) throw new ConfigError("sonar.token");

    // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/clair/-/issues/54]: try to stick to one
    this.client = SonarQubeClient.withBasicAuth(server, token);
    this.sonar = axios.create({
      baseURL: server,
      auth: {
        username: token,
        password: ""
      }
    });
  }

  private async iterateEndpoint(endpoint: string, key: string, params?: Record<string, string | number | boolean>) {
    let i = 0;
    let total = Infinity;
    let res: any[] = [];
    const ps = 500;
    do {
      const { data } = await this.sonar.get(endpoint, { params: { p: i + 1, ps, ...params } });
      total = data.paging.total;
      res = [...res, ...data[key]];
      i++;
    } while (i * ps < total);
    return res;
  }

  async getProjects() {
    return this.iterateEndpoint("/api/components/search_projects", "components");
  }

  async getQualityGates(projectKey: string) {
    const params = { projectKey };
    const res = await this.sonar.get("/api/qualitygates/project_status", { params });
    return res.data.projectStatus;
  }

  async getHotspots(projectKey: string) {
    return this.iterateEndpoint("/api/hotspots/search", "hotspots", { projectKey, status: "TO_REVIEW", onlyMine: false, inNewCodePeriod: false });
  }

  async getCodeSmells(projectKey: string) {
    const iterator = this.client.issues
      .search()
      .componentKeys([projectKey])
      .onlyUnresolved()
      .withTypes(["CODE_SMELL"])
      .all();
    const res: Issue[] = [];
    for await (const issue of iterator) {
      res.push(issue);
    }
    return res;
  }
}
