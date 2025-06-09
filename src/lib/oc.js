import { executeScript } from "./cmd.js";

export function login() {
  return executeScript("oc/login", {
    supressStdout: true
  });
}

export function getPods(project) {
  return executeScript("oc/get_pods", {
    args: [project],
    supressStdout: true
  }).split("\n").map((s) => s.split(" ")[0]);
}

export function getProjects() {
  return executeScript("oc/get_projects", {
    supressStdout: true
  }).split("\n").map((s) => s.split(" ")[0]);
}

export function tailLog(pod) {
  return executeScript("oc/tail_log", { args: [pod] });
}

export function remoteSession(pod) {
  return executeScript("oc/remote_session", { args: [pod] });
}

export function getDeployment(pod) {
  return pod.split("-").slice(0, -2).join("-");
}

export function restartDeployment(deployment) {
  return executeScript("oc/restart", { args: [deployment] });
}

export function downloadLogs(pod, pods, project) {
  executeScript("oc/download_logs", { args: [pod, pods, project] });
}

