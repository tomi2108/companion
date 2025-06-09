const config = require("../lib/config.cjs");
const { search } = require("../lib/ui.cjs");
const { readdirs } = require("../lib/utils.cjs");
const { getApp } = require("./files.cjs");
const { getProjects, getItemNamesFromResource } = require("./oc.cjs");

async function promptForApp() {
  const apps = readdirs(config.paths.despliegues);
  const app_name = await search({ choices: apps });
  return await getApp(app_name);
}

async function promptForOcProject() {
  const projects = getProjects();
  const project = await search({ choices: getItemNamesFromResource(projects) });
  if (!project) return process.exit(1);
  return project;
}

async function promptForOcResource(resources, message) {
  const resource = await search({ choices: getItemNamesFromResource(resources), message });
  if (!resource) return process.exit(1);
  return resources.items.find((r) => r.metadata.name === resource);
}

module.exports = { promptForApp, promptForOcProject, promptForOcResource };
