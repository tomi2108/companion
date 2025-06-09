const config = require("../lib/config.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { readdirs } = require("../lib/utils.cjs");
const { Repo } = require("../lib/repo.cjs");
const { executeScript } = require("./cmd.cjs");
const { cwd } = require("node:process");
const { DeployRepo } = require("../lib/deploy_repo.cjs");
const { AppRepo } = require("../lib/app_repo.cjs");

async function getApp(app_name) {
  let deploy_repo = null;
  let app_repo = null;

  const deployDirs = readdirs(config.paths.despliegues)
    .map((d) => path.join(config.paths.despliegues, d))
    .filter(Repo.isGitRepo);

  for (const d of deployDirs) {
    deploy_repo = new DeployRepo(d);
    if (app_name === await deploy_repo.getName()) break;
  }

  const appDirs = [config.paths.frontend, config.paths.backend]
    .flatMap((p) => readdirs(p).map((d) => path.join(p, d)))
    .filter(Repo.isGitRepo);

  for (const d of appDirs) {
    app_repo = new AppRepo(d);
    if (app_name === await app_repo.getName()) break;
  }

  return { deploy_repo, app_repo };
}

function createDirIfNotExists(dir) {
  const exists = fs.existsSync(dir);
  if (!exists) fs.mkdirSync(dir, { recursive: true });
  return { created: !exists };
}

function accessObj(obj, keys) {
  const val = obj?.[keys?.[0]];
  if (val === null || val === undefined) return null;
  if (typeof val !== "object") return val;
  return accessObj(val, keys.slice(1));
}

function externalEnvs(full_path) {
  const file_content = fs.readFileSync(full_path).toString();
  const replaced = file_content
    .replace(new RegExp(`.${config.openshift.namespace_prefix}`, "g"), `-${config.openshift.namespace_prefix}`)
    .replace(/\.svc\.cluster\.local:8080/g, ".apps.ocpnp.cuyorh.tcloud.ar");
  fs.writeFileSync(full_path, replaced);
}

function internalEnvs(full_path) {
  const file_content = fs.readFileSync(full_path);
  const replaced = file_content
    .replaceAll(new RegExp(`-${config.openshift.namespace_prefix}`, "g"), `.${config.openshift.namespace_prefix}`)
    .replaceAll(/\.apps\.ocpnp\.cuyorh\.tcloud\.ar/g, ".svc.cluster.local:8080");
  fs.writeFileSync(full_path, replaced);
}

async function openEditorAndWaitForSave(full_path) {
  return executeScript("editor", {
    args: [full_path]
  });
}

function getCurrentPath() {
  return cwd();
}

function getDeploymentOption(path, type, env, y) {
  const keys = path.split(".");

  const env_type_value = accessObj(config.openshift?.deployments?.[env]?.[type], keys);
  if (env_type_value !== null && env_type_value !== undefined) return env_type_value;

  const type_env_value = accessObj(config.openshift?.deployments?.[type]?.[env], keys);
  if (type_env_value !== null && type_env_value !== undefined) return type_env_value;

  const type_value = accessObj(config.openshift?.deployments?.[type], keys);
  if (type_value !== null && type_value !== undefined) return type_value;

  const env_value = accessObj(config.openshift?.deployments?.[env], keys);
  if (env_value !== null && env_value !== undefined) return env_value;

  const deployment_value = accessObj(config.openshift?.deployments, keys);
  if (env_value !== null && env_value !== undefined) return deployment_value;

  return accessObj(y, keys);
}

module.exports = {
  createDirIfNotExists,
  getDeploymentOption,
  getApp,
  externalEnvs,
  internalEnvs,
  openEditorAndWaitForSave,
  getCurrentPath
};
