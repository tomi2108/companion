import { executeScript, clearConsole } from "../cmd";
import { EXCLUDED_SECRETS } from "../../lib/constants";
import { Config } from "../../lib/config";
import axios, { AxiosInstance } from "axios";
import { Project, ProjectResponse } from "./project";
import { Secret } from "./secret";

export const oc = (server: "cuyo" | "brc" = "cuyo") => {

  const oc_config = Config.get().openshift;
  const s = server === "cuyo" ? oc_config.server_cuyo : oc_config.server_barracas;
  const t = server === "cuyo" ? oc_config.token_cuyo : oc_config.token_barracas;
  // const string = `${Config.get().openshift.username}:${Config.get().openshift.password}`;
  // const encodedString = base64Encode(string);
  return axios.create({
    baseURL: `${s}`,
    headers: { Authorization: `Bearer ${t}` }
    // headers: { Authorization: `Basic ${encodedString}` }
  });
};

export class Openshift {
  private oc: AxiosInstance;

  constructor(s: "cuyo" | "brc" = "cuyo") {
    this.oc = oc(s);
  }

  async getProjects() {
    return (await this.oc.get("/apis/project.openshift.io/v1/projects"))
      .data.items.map((r: ProjectResponse) => Project.fromProjectResponse(r, this.oc)) as Project[];
  }
}

export function remoteSession(pod: string) {
  clearConsole();
  return executeScript("oc/remote_session", { args: [pod] });
}

export function generateRoutes(name: string, port: number, insecurePolicy: string, pathname: string, host: string) {
  return executeScript("oc/routes_generate", {
    args: [name, String(port), insecurePolicy, pathname, host]
  });
}

export const filterExcludedSecrets = (s: Secret) => !EXCLUDED_SECRETS.includes(s.name);
//                                      (cm :Configmap)
export const filterExcludedConfigmaps = () => true;
