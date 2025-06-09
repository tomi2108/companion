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
  });
}

export function getProjects() {
  return executeScript("oc/get_projects", {
    supressStdout: true
  });
}

export function tailLog(pod) {
  return executeScript("oc/tail_log", { args: [pod] });
}
