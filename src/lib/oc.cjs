const path = require("node:path");
const { executeScript } = require("./cmd.cjs");
const config = require("./config.cjs");

function login() {
  try {
    executeScript("oc/login", {
      supressStdout: true
    });
  } catch (err) {
    if (err.stdout.toString().includes("couldn't get current server API"));
    console.error("Could not connect to Openshift instance, check network settings (VPN), connectivity and credentials");
    process.exit(1);
  }
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

function deploy(env, app, version) {
  executeScript("oc/deploy", {
    args: [env, path.join(config.paths.despliegues, app), version]
  });
}

module.exports = {
  downloadLogs,
  restartDeployment,
  tailLog,
  login,
  remoteSession,
  getDeployment,
  getProjects,
  getPods,
  deploy
};
