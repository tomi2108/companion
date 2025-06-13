import { executeScript, clearConsole } from "./cmd";
import { EXCLUDED_SECRETS } from "../lib/constants";
import { Config } from "../lib/config";
import axios, { AxiosInstance } from "axios";
import { Project } from "./project";

export const oc = () => {
  // const string = `${Config.get().openshift.username}:${Config.get().openshift.password}`;
  // const encodedString = Buffer.from(string).toString("base64");
  return axios.create({
    baseURL: `${Config.get().openshift.server_cuyo}`,
    // headers: { Authorization: `Basic ${encodedString}` }
    headers: { Authorization: `Bearer ${Config.get().openshift.token}` }
  });
};

export class Openshift {
  server: string;
  private oc: AxiosInstance;

  constructor(server?: string) {
    this.server = server ?? Config.get().openshift.server_cuyo;
    this.oc = oc();
  }

  async getProjects() {
    return (await this.oc.get("/apis/project.openshift.io/v1/projects"))
      .data.items.map(Project.fromProjectResponse) as Project[];
  }
}

export function remoteSession(pod: string) {
  clearConsole();
  return executeScript("oc/remote_session", { args: [pod] });
}

export function restartDeployment(deployment: string) {
  return executeScript("oc/restart", { args: [deployment] });
}

export function downloadLogs(pod: string, pods: string, project: string) {
  executeScript("oc/download_logs", { args: [pod, pods, project] });
}

export function getDeployments(project: string) {
  return JSON.parse(executeScript("oc/get", {
    args: [project, "deployments"],
    supressStdout: true
  }));
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

export function createEnv(project: string, type: string, name: string, from_file: string) {
  return executeScript("oc/create", {
    args: [project, type, name, from_file]
  });
}

export function deleteEnv(project: string, type: string, name: string) {
  return executeScript("oc/delete", {
    args: [project, type, name]
  });
}

export function editEnv(project: string, type: string, name: string) {
  // TODO : I dont think this works with vscode...
  // may be we need to create a tmp_file and do the same
  // we are doing with create command
  return executeScript("oc/edit", {
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

