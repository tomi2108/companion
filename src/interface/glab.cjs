const { Gitlab } = require("@gitbeaker/rest");
const config = require("../lib/config.cjs");
const path = require("node:path");
const { createDirIfNotExists } = require("./files.cjs");
const log = require("../lib/log.cjs");
const { Repo } = require("./repo.cjs");

const glab = () => new Gitlab({
  token: config.gitlab.token,
  host: config.gitlab.server
});

async function getCurrentUser() {
  return (await glab().Search.all("users", config.gitlab.username))[0];
}

async function getProjects(id) {
  return await glab().Groups.allProjects(id);
}

async function cloneProject(project, full_path) {
  const name = project.path;
  const clone_url = project.http_url_to_repo;
  const clone_path = path.join(full_path, name);

  const { created } = createDirIfNotExists(clone_path);
  if (!created) return null;

  await Repo.cloneRepo(clone_url, full_path);
  log.info(`Cloning ${name} into ${clone_path}`);
  return true;
}

async function cloneGroupOrProject(id, full_path) {
  try {
    const projects = await getProjects(id);
    for (const project of projects) {
      const name = project.path;
      const cloned = await cloneProject(project, full_path);
      if (!cloned) {
        log.info(`Skipping cloning of ${name} because it already exists`);
        continue;
      }
      continue;
    }
  } catch {
    const project = await glab().Projects.show(id);
    const name = project.path;
    const cloned = await cloneProject(project, full_path);
    if (!cloned) log.info(`Skipping cloning of ${name} because it already exists`);
  }
}

module.exports = { getCurrentUser, cloneGroupOrProject };
