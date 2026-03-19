import axios, { AxiosInstance } from "axios";

import { base64Encode } from "@files/utils";
import { Config } from "@lib/config";

import { oc } from "./api";
import { Project, ProjectResponse } from "./project";

const tokenCache = new Map<string, string>();

export class OpenshiftServer {
  private oc?: AxiosInstance;
  name: string;
  url: string;
  authUrl: string;
  username: string;
  password: string;

  constructor(name: string) {
    const cfg = Config.getView().get("openshift");
    const serverConfig = cfg.servers?.[name];
    if (!serverConfig) throw new Error(`No config found for openshift server ${name}`);
    this.name = name;
    this.url = serverConfig.url;
    this.authUrl = serverConfig.authUrl;
    this.username = serverConfig.username ?? cfg.username;
    this.password = serverConfig.password ?? cfg.password;
    if (!this.username) throw new Error(`No username found for server ${name}`);
    if (!this.password) throw new Error(`No password found for server ${name}`);
  }

  private async getToken() {
    if (tokenCache.has(this.name)) return tokenCache.get(this.name) as string;
    const string = `${this.username}:${this.password}`;
    const encodedString = base64Encode(string);

    const params = {
      client_id: "openshift-challenging-client",
      code_challenge_method: "S256",
      response_type: "token",
      redirect_uri: `${this.authUrl}/oauth/token/implicit`
    };

    const headers = {
      Authorization: `Basic ${encodedString}`,
      "X-CSRF-Token": "1"
    };

    try {
      await axios.get(`${this.authUrl}/oauth/authorize`, { maxRedirects: 0, params, headers });
      throw new Error("Unreachable");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.headers.location) {
        const access_token = new URLSearchParams(
          new URL(err.response?.headers.location).hash.slice(1)
        ).get("access_token") ?? "";
        tokenCache.set(this.name, access_token);
        return access_token;
      } else {
        console.dir(err, { depth: null });
        throw err;
      }
    }
  }

  async authenticate() {
    if (this.oc) return this;
    const token = await this.getToken();
    this.oc = oc(token, this.url);
    return this;
  }

  async getProjects() {
    if (!this.oc) throw new Error("Authenticate first");

    const { data } = await this.oc.get("/apis/project.openshift.io/v1/projects");
    return data.items.map((r: ProjectResponse) => Project.fromProjectResponse(r, this.oc!)) as Project[];
  }

  async getProject(namespace: string) {
    if (!this.oc) throw new Error("Authenticate first");

    const res = (await this.oc.get(`/apis/project.openshift.io/v1/projects/${namespace}`))
      .data;
    return Project.fromProjectResponse(res, this.oc);
  }

  toChoice() {
    return { name: this.name };
  }
}
