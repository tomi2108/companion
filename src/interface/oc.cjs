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
  return JSON.parse(executeScript("oc/get", {
    args: [project, "pods"],
    supressStdout: true
  }));
}

function getProjects() {
  return JSON.parse(executeScript("oc/get_projects", {
    supressStdout: true
  }));
}

function tailLog(pod) {
  clearConsole();
  return executeScript("oc/tail_log", { args: [pod] });
}

function remoteSession(pod) {
  clearConsole();
  return executeScript("oc/remote_session", { args: [pod] });
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

function getDeployments(project) {
  return JSON.parse(executeScript("oc/get", {
    args: [project, "deployments"],
    supressStdout: true
  }));
}

function getDeployment(project, deployment) {
  return JSON.parse(executeScript("oc/get", {
    args: [project, "deployment", deployment],
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
  return executeScript("oc/create", {
    args: [project, type, name, from_file]
  });
}

function deleteEnv(project, type, name) {
  return executeScript("oc/delete", {
    args: [project, type, name]
  });
}

function editEnv(project, type, name) {
  // TODO : I dont think this works with vscode...
  // may be we need to create a tmp_file and do the same
  // we are doing with create command
  return executeScript("oc/edit", {
    args: [project, type, name]
  });
}

function getConfigMapsFromProject(project) {
  return JSON.parse(executeScript("oc/get", {
    args: [project, "configmaps"],
    supressStdout: true
  }));
}

function getSecretsFromProject(project) {
  return JSON.parse(executeScript("oc/get", {
    args: [project, "secrets"],
    supressStdout: true
  }));
}

function getItemNamesFromResource(resource) {
  return resource.items.map((e) => e.metadata.name);
}

module.exports = {
  deploy,
  downloadLogs,
  createEnv,
  deleteEnv,
  editEnv,
  getConfigMapsFromDeployment,
  getDeployment,
  getSecretsFromProject,
  getConfigMapsFromProject,
  getPods,
  getProjects,
  getSecretsFromDeployment,
  login,
  remoteSession,
  extract,
  restartDeployment,
  getDeployments,
  tailLog,
  getItemNamesFromResource
};
