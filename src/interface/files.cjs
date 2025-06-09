const config = require("../lib/config.cjs");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
const { readdirs } = require("../lib/utils.cjs");
const { MS_TYPES, ENVS } = require("../lib/constants.cjs");
const { getOriginUrl, isGitRepo } = require("./git.cjs");

async function getMsType(name) {
  return MS_TYPES
    .reduce((acc, curr) => name.includes(curr) ? curr : null)
    ?? config.openshift.default_ms_type
    ?? MS_TYPES[0];
}

function isDeployYamlFile(f) {
  return f.isFile() && ENVS.some((e) => f.name.includes(e));
}

async function getRepo(search_path, app_name) {
  const dirs = readdirs(search_path);
  for (const d of dirs) {
    const possible_path = path.join(search_path, d);
    if (!isGitRepo(possible_path)) continue;
    const origin = await getOriginUrl(possible_path);
    const possible_app_name = origin.split("/").at(-1).split(".").at(0);
    if (app_name === possible_app_name) {
      const package_file = JSON.parse(fs.readFileSync(path.join(possible_path, "package.json")));
      return {
        full_path: possible_path,
        name: package_file.name,
        version: package_file.version
      };
    }
  }
  return null;
}

async function getApp(app_name) {
  // TODO: handle app_path being null
  let app_path = null;
  const dirs = readdirs(config.paths.despliegues);
  for (const d of dirs) {
    const possible_path = path.join(config.paths.despliegues, d);
    if (!isGitRepo(possible_path)) continue;
    const origin = await getOriginUrl(possible_path);
    const possible_app_name = origin.split("/").at(-1).split(".").at(0);
    if (app_name === possible_app_name) {
      app_path = possible_path;
      break;
    }
  }
  const repo = getRepo(config.paths.frontend, app_name) ?? getRepo(config.paths.backend, app_name) ?? null;

  const ret = {};
  if (app_path) {
    const app_dir = fs.readdirSync(app_path, { withFileTypes: true });
    const yaml_files = app_dir
      .filter(isDeployYamlFile)
      .map((f) => path.join(app_path, f.name));
    const parsedYamls = yaml_files.map(parseYaml);
    ret.deployments = parsedYamls
      .map(({ env, yaml_content, file_path, version }) => ({
        env,
        file_path,
        version,
        yaml: yaml_content
      }));
  }

  ret.name = app_name;
  ret.type = getMsType(ret.name);
  ret.version = repo?.version ?? null;
  ret.full_path = repo?.full_path ?? null;
  ret.deploy_path = app_path;
  ret.deployments ??= null;

  return ret;
}

function parseYaml(file_path) {
  const file_content = fs.readFileSync(file_path);
  const env = ENVS.find((e) => path.basename(file_path).includes(e));
  const yaml_content = yaml.load(file_content)?.["helm-chart-master"];
  if (!yaml_content) return null;

  const version = yaml_content.image.tag;
  return { env, file_path, version, yaml_content };
}

function createDirIfNotExists(dir) {
  const exists = fs.existsSync(dir);
  if (!exists) fs.mkdirSync(dir, { recursive: true });
  return { created: !exists };
}

function accessObj(obj, keys) {
  const val = obj?.[keys?.[0]];
  if (!val) return null;
  if (val && typeof val !== "object") return val;
  return accessObj(val, keys.slice(1));
}

function getDeploymentOption(path, type, env, y) {
  const keys = path.split(".");

  const env_type_value = accessObj(config.openshift?.deployments?.[env]?.[type], keys);
  if (env_type_value) return env_type_value;

  const type_env_value = accessObj(config.openshift?.deployments?.[type]?.[env], keys);
  if (type_env_value) return type_env_value;

  const type_value = accessObj(config.openshift?.deployments?.[type], keys);
  if (type_value) return type_value;

  const env_value = accessObj(config.openshift?.deployments?.[env], keys);
  if (env_value) return env_value;

  const deployment_value = accessObj(config.openshift?.deployments, keys);
  if (deployment_value) return deployment_value;

  return accessObj(y, keys);
}

function prepareYamlForDeploy(y, type, env) {
  // TODO: add elasticsearch automatically as last secret
  y.dynatrace.modulo = config.dynatrace?.modulo ?? y.dynatrace.modulo ?? "NO_INFORMADO";
  y.dynatrace.tipo = type === "app" ? "MICROFRONTEND" : type.toUpperCase();
  y.dynatrace.clave_jira = config.jira?.project_key ?? y.dynatrace.clave_jira ?? "NO_INFORMADO";
  // TODO: vincular con Jira ?
  y.dynatrace.masivo_critico = "NO";
  y.dynatrace.issue_jira = "NO_INFORMADO";

  y.route.enabled = getDeploymentOption("route.enabled", type, env, y);

  y.resources.limits.cpu = getDeploymentOption("resources.limits.cpu", type, env, y);
  y.resources.limits.memory = getDeploymentOption("resources.limits.memory", type, env, y);

  y.resources.requests.cpu = getDeploymentOption("resources.requests.cpu", type, env, y);
  y.resources.requests.memory = getDeploymentOption("resources.requests.memory", type, env, y);

  y.autoscaling.enabled = getDeploymentOption("autoscaling.enabled", type, env, y);
  y.autoscaling.minReplicas = getDeploymentOption("autoscaling.minReplicas", type, env, y);
  y.autoscaling.maxReplicas = getDeploymentOption("autoscaling.maxReplicas", type, env, y);

  y.readinessProbe.enabled = getDeploymentOption("readinessProbe.enabled", type, env, y);

  y.configmapENV.ELK_LOGS = getDeploymentOption("configmapENV.ELK_LOGS", type, env, y);
  y.configmapENV.ELK_LOGS_DEBUG = getDeploymentOption("configmapENV.ELK_LOGS_DEBUG", type, env, y);
  y.configmapENV.STDOUT_LOGS = getDeploymentOption("configmapENV.STDOUT_LOGS", type, env, y);

  y.labels.lproduct = config.openshift.product ?? y.labels.lproduct;
  y.labels.lenvironment = env;
  return y;
}

function yamlToString(y) {
  return yaml.dump({ "helm-chart-master": y });
}

module.exports = {
  createDirIfNotExists,
  prepareYamlForDeploy,
  getApp,
  yamlToString
};
