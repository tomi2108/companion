const config = require("../lib/config.cjs");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
const { readdirs } = require("../lib/utils.cjs");
const log = require("../lib/log.cjs");

function getRepo(search_path, app_name) {
  const dir = readdirs(search_path);
  const matcher = (name) => name.includes(app_name);
  for (const d of dir) {
    const full_path = path.join(search_path, d);
    const package_file = JSON.parse(fs.readFileSync(path.join(full_path, "package.json")));
    const name = package_file.name;
    if (!matcher(name)) continue;
    const version = package_file.version;
    // TODO: get type
    const type = "fcd";

    return { full_path, name, version, type };
  }
  return null;
}

function getOcYaml(env, app_name) {
  const dir = path.join(config.paths.despliegues, app_name);
  const file = fs.readdirSync(dir).find((f) => f.includes(env));
  if (!file) return null;
  const full_path = path.join(dir, file);
  const file_content = fs.readFileSync(full_path);
  const yaml_content = yaml.load(file_content)?.["helm-chart-master"];
  if (!yaml_content) return null;

  const name = yaml_content.image.repository.split("/").at(-1);
  const version = yaml_content.image.tag;
  return { name, full_path, version };
}

function createDirIfNotExists(dir) {
  const exists = fs.existsSync(dir);
  if (!exists) fs.mkdirSync(dir, { recursive: true });
  return { created: !exists };
}

function searchAndReplace(file, regex, replace) {
  const fileAsString = fs.readFileSync(file).toString();
  const replaced = fileAsString.replace(regex, replace);
  if (!replaced || !fileAsString) {
    log.error(`Failed while replacing ${regex.toString()} with ${replace} in ${file}, file is empty`);
    process.exit(1);
  }
  fs.writeFileSync(file, replaced);
}

module.exports = {
  getRepo,
  getOcYaml,
  createDirIfNotExists,
  searchAndReplace
};
