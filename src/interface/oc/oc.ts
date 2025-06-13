import { executeScript, clearConsole } from "../cmd";
import { EXCLUDED_SECRETS } from "../../lib/constants";
import { Config } from "../../lib/config";
import axios, { AxiosInstance } from "axios";
import { Project, ProjectResponse } from "./project";

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

export function getDeployment(project: string, deployment: string) {
  return JSON.parse(executeScript("oc/get", {
    args: [project, "deployment", deployment],
    supressStdout: true
  }));
}

export function getConfigMapsFromDeployment(deploymentJson: any) {
  return deploymentJson.spec.template.spec.containers[0].envFrom
    .map((e: any) => e.configMapRef).filter(Boolean).map((cm: any) => cm.name);
}

export function getSecretsFromDeployment(deploymentJson: any) {
  return deploymentJson.spec.template.spec.containers[0].envFrom
    .map((e: any) => e.secretRef).filter(Boolean).map((s: any) => s.name)
    .filter((s: any) => !EXCLUDED_SECRETS.includes(s));
}

export function extract(type: string, project: string, value: string, to: string) {
  return executeScript("oc/extract", {
    args: [type, project, value, to],
    supressStdout: true
  }).split("\n").filter(Boolean);
}

export function deleteEnv(project: string, type: string, name: string) {
  return executeScript("oc/delete", {
    args: [project, type, name]
  });
}

export function getConfigMapsFromProject(project: string) {
  return JSON.parse(executeScript("oc/get", {
    args: [project, "configmaps"],
    supressStdout: true
  }));
}

export function getSecretsFromProject(project: string) {
  return JSON.parse(executeScript("oc/get", {
    args: [project, "secrets"],
    supressStdout: true
  }));
}

export type Resource = {
  metadata: {
    name: string;
  };
};

export function generateRoutes(name: string, port: number, insecurePolicy: string, pathname: string, host: string) {
  return executeScript("oc/routes_generate", {
    args: [name, String(port), insecurePolicy, pathname, host]
  });
}

