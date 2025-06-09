const config = require("../lib/config.cjs");
const path = require("node:path");
const { executeScript, clearConsole } = require("./cmd.cjs");
const { EXCLUDED_SECRETS } = require("../lib/constants.cjs");

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
  clearConsole();
  return executeScript("oc/tail_log", { args: [pod] });
}

function remoteSession(pod) {
  clearConsole();
  return executeScript("oc/remote_session", { args: [pod] });
}

function getDeploymentFromPodName(pod) {
  return pod.split("-").slice(0, -2).join("-");
}

function restartDeployment(deployment) {
  return executeScript("oc/restart", { args: [deployment] });
}

function downloadLogs(pod, pods, project) {
  executeScript("oc/download_logs", { args: [pod, pods, project] });
}

function deploy(envs, app, version) {
  executeScript("oc/deploy", {
    args: [path.join(config.paths.despliegues, app), version, envs.join(" ")]
  });
}

function getDeployment(deployment, project) {
  return JSON.parse(executeScript("oc/get_deployment", {
    args: [deployment, project],
    supressStdout: true
  }));
}

function getConfigMapsFromDeployment(deploymentJson) {
  return deploymentJson.spec.template.spec.containers[0].envFrom
    .map((e) => e.configMapRef).filter(Boolean).map((cm) => cm.name);
}

function getSecretsFromDeployment(deploymentJson) {
  return deploymentJson.spec.template.spec.containers[0].envFrom
    .map((e) => e.secretRef).filter(Boolean).map((s) => s.name)
    .filter((s) => !EXCLUDED_SECRETS.includes(s));
}

function extract(type, project, value, to) {
  return executeScript("oc/extract", {
    args: [type, project, value, to],
    supressStdout: true
  }).split("\n").filter(Boolean);
}

function createEnv(project, type, name, from_file) {
  return JSON.parse(executeScript("oc/create", {
    args: [project, type, name, from_file]
  }));
}

module.exports = {
  deploy,
  downloadLogs,
  createEnv,
  getConfigMapsFromDeployment,
  getDeployment,
  getDeploymentFromPodName,
  getPods,
  getProjects,
  getSecretsFromDeployment,
  login,
  remoteSession,
  extract,
  restartDeployment,
  tailLog
};
