import axios, { AxiosInstance } from "axios";
import SonarQubeClient from "sonarqube-web-api-client";

import { Config, ConfigError } from "@lib/config";

export class SonarQube {

  private sonar: AxiosInstance;
  private client;

  constructor() {
    const server = Config.get().sonar.server;
    const token = Config.get().sonar.token;
    if (!server) throw new ConfigError("sonar.server");
    if (!token) throw new ConfigError("sonar.token");

    // TODO: try to stick to one
    this.client = SonarQubeClient.withBasicAuth(server, token);
    this.sonar = axios.create({
      baseURL: server,
      auth: {
        username: token,
        password: ""
      }
    });
  }

  async getProjects() {
    let i = 0;
    let total = Infinity;
    let res: any[] = [];
    const ps = 500;
    do {
      const { data } = await this.sonar.get("/api/components/search_projects", { params: { p: i + 1, ps } });
      total = data.paging.total;
      res = [...res, ...data.components];
      i++;
    } while (i * ps < total);
    return res;
  }

  async getCodeSmells(projectKey: string) {
    const iterator = this.client.issues
      .search()
      .componentKeys([projectKey])
      .onlyUnresolved()
      .withTypes(["CODE_SMELL"])
      .all();
    const res: any[] = [];
    for await (const issue of iterator) {
      res.push(issue);
    }
    return res;
  }
}
