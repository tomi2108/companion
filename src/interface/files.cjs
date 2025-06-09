const config = require("../lib/config.cjs");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
const { readdirs } = require("../lib/utils.cjs");
const { MS_TYPES, ENVS } = require("../lib/constants.cjs");

function getRepo(search_path, app_name) {
  const dir = readdirs(search_path);
  const matcher = (name) => name.includes(app_name);
  for (const d of dir) {
    const full_path = path.join(search_path, d);
    const package_file = JSON.parse(fs.readFileSync(path.join(full_path, "package.json")));
    const name = package_file.name;
    if (!matcher(name)) continue;
    const version = package_file.version;

    return { full_path, name, version };
  }
  return null;
}

function getApp(app_name) {
  const app_path = path.join(config.paths.despliegues, app_name);
  const app_dir = fs.readdirSync(app_path, { withFileTypes: true });
  const yaml_files = app_dir
    .filter((f) => f.isFile() && ENVS.some((e) => f.name.includes(e)))
    .map((f) => path.join(f.parentPath, f.name));

  const parsedYamls = yaml_files.map(parseYaml);
  const ret = {};
  ret.deployments = parsedYamls.map(({ env, yaml_content, file_path, version }) => ({
    env,
    file_path,
    version,
    yaml: yaml_content
  }));

  ret.name = parsedYamls?.[0].name ?? null;
  ret.type = parsedYamls?.[0].type ?? null;
  const repo = getRepo(config.paths.frontend, app_name) ?? getRepo(config.paths.backend, app_name) ?? null;
  ret.version = repo?.version ?? null;
  ret.full_path = repo?.full_path ?? null;
  ret.deploy_path = app_path;

  return ret;
}

function parseYaml(file_path) {
  const file_content = fs.readFileSync(file_path);
  const env = ENVS.find((e) => path.basename(file_path).includes(e));
  const yaml_content = yaml.load(file_content)?.["helm-chart-master"];
  if (!yaml_content) return null;

  const name = yaml_content.image.repository.split("/").at(-1);
  const version = yaml_content.image.tag;
  const type = MS_TYPES.reduce((acc, curr) => name.includes(curr) ? curr : null) ?? config.openshift.default_ms_type ?? MS_TYPES[0];
  return { env, name, file_path, version, type, yaml_content };
}

function createDirIfNotExists(dir) {
  const exists = fs.existsSync(dir);
  if (!exists) fs.mkdirSync(dir, { recursive: true });
  return { created: !exists };
}

function prepareYamlForDeploy(y) {
  // TODO: migrate dep-yaml script
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";
  y.resources.limits.cpu = "";

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
