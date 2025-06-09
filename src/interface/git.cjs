const fs = require("node:fs");
const path = require("node:path");
const gitCreate = require("simple-git");

const git = (full_path) => gitCreate({ baseDir: full_path });

async function getTags(full_path) {
  await git(full_path).fetch(["--tags"]);
  const tags = await git(full_path).tags({ "--sort": "-v:refname" });
  return tags.all;
}

async function cloneRepo(link, full_path) {
  await git(full_path).clone(link);
}

async function stash(full_path, callback) {
  const g = git(full_path);
  const { total: stash_before } = await g.stashList();
  await g.stash(["--include-untracked"]);
  const { total: stash_after } = await g.stashList();
  await callback();
  if (stash_after !== stash_before) await g.stash(["pop"]);
}

async function createNewBranch(full_path, name) {
  const g = git(full_path);
  try {
    await g.deleteLocalBranch(name, true);
  } catch { }
  await g.checkoutLocalBranch(name);
}

async function add(full_path, file) {
  await git(full_path).add(file);
}

async function commit(full_path, message) {
  await git(full_path).commit(message);
}

async function switchBranch(full_path, branch) {
  await git(full_path).checkout(branch);
}

async function switchBranchIfExists(full_path, branch) {
  const g = git(full_path);
  const branches = await g.branchLocal();
  if (!branches.all.includes(branch)) return;
  await g.checkout(branch);
}

async function pull(full_path) {
  await git(full_path).pull();
}

async function getOriginUrl(full_path) {
  const url = await git(full_path).getConfig("remote.origin.url");
  return url.value;
}

function isGitRepo(full_path) {
  return fs.existsSync(path.join(full_path, ".git"));
}

module.exports = {
  add,
  pull,
  getTags,
  commit,
  cloneRepo,
  stash,
  switchBranch,
  createNewBranch,
  getOriginUrl,
  switchBranchIfExists,
  isGitRepo
};
