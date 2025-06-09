const { Gitlab } = require("@gitbeaker/rest");
const config = require("../lib/config.cjs");
const path = require("node:path");
const { cloneRepo: gitCloneRepo, getOriginUrl, push, getActiveBranch, getDiffCommits } = require("./git.cjs");
const { createDirIfNotExists } = require("./files.cjs");
const log = require("../lib/log.cjs");

const glab = () => new Gitlab({
  token: config.gitlab.token,
  host: config.gitlab.server
});

async function getProjects(id) {
  return await glab().Groups.allProjects(id);
}

async function cloneProject(project, full_path) {
  const name = project.path;
  const clone_url = project.http_url_to_repo;
  const clone_path = path.join(full_path, name);

  const { created } = createDirIfNotExists(clone_path);
  if (!created) return null;

  await gitCloneRepo(clone_url, full_path);
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

async function getProject(full_path) {
  const origin_url = await getOriginUrl(full_path);
  const url = new URL(origin_url);
  const pathname = url.pathname.slice(0, -4).slice(1);
  const name = pathname.split("/").at(-1);
  // TODO: should probably find a better way
  // of getting gitlab info of a project based on
  // git workspace
  const matches = await glab().Projects.search(name);
  return matches.find((r) => pathname === r.path_with_namespace);
}

async function getCurrentUser() {
  return (await glab().Search.all("users", config.gitlab.username))[0];
}

async function getMrDescriptionFromCommits(commits) {
  // TODO: not working :p
  return commits.map((c) => `• ${c.message}`).join("\n");
}

async function createMr(full_path, branch) {
  await push(full_path);
  const project = await getProject(full_path);
  const sourceBranch = await getActiveBranch(full_path);
  const commits = await getDiffCommits(full_path, sourceBranch, branch);
  const title = commits[0].message;
  const assigneeId = (await getCurrentUser()).id;
  const description = await getMrDescriptionFromCommits(commits);
  return await glab().MergeRequests.create(project.id, sourceBranch, branch, title, {
    description,
    removeSourceBranch: true,
    assigneeId
  });
}

async function createAndMergeMr(full_path, branch) {
  const mr = await createMr(full_path, branch);
  // TODO: Merge mr
}

module.exports = { cloneGroupOrProject, createAndMergeMr };
