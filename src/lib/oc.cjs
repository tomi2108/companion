const { executeScript } = require("./cmd.cjs");

function login() {
  return executeScript("oc/login", {
    supressStdout: true
  });
}

function getPods(project) {
  return executeScript("oc/get_pods", {
    args: [project],
    supressStdout: true
  }).split("\n").map((s) => s.split(" ")[0]);
}

function getProjects() {
  return executeScript("oc/get_projects", {
    supressStdout: true
  }).split("\n").map((s) => s.split(" ")[0]);
}

function tailLog(pod) {
  return executeScript("oc/tail_log", { args: [pod] });
}

function remoteSession(pod) {
  return executeScript("oc/remote_session", { args: [pod] });
}

function getDeployment(pod) {
  return pod.split("-").slice(0, -2).join("-");
}

function restartDeployment(deployment) {
  return executeScript("oc/restart", { args: [deployment] });
}

function downloadLogs(pod, pods, project) {
  executeScript("oc/download_logs", { args: [pod, pods, project] });
}

module.exports = {
  downloadLogs,
  restartDeployment,
  tailLog,
  login,
  remoteSession,
  getDeployment,
  getProjects,
  getPods
};
