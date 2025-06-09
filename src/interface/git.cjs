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

async function push(full_path) {
  return await git(full_path).push("origin");
}

async function getConfig(full_path, key) {
  const k = await git(full_path).getConfig(key);
  return k.value;
}

async function setConfig(full_path, key, value) {
  await git(full_path).setConfig(key, value);
}

async function getOriginUrl(full_path) {
  return getConfig(full_path, "remote.origin.url");
}

function isGitRepo(full_path) {
  return fs.existsSync(path.join(full_path, ".git"));
}

async function getActiveBranch(full_path) {
  return (await git(full_path).branchLocal()).current;
}

async function getCommits(full_path) {
  return (await git(full_path).log()).all;
}

async function getDiffCommits(full_path, sourceBranch, targetBranch) {
  return (await git(full_path).log({ from: sourceBranch, to: targetBranch })).all;
}

module.exports = {
  add,
  pull,
  push,
  getTags,
  commit,
  cloneRepo,
  stash,
  switchBranch,
  createNewBranch,
  getOriginUrl,
  setConfig,
  switchBranchIfExists,
  getActiveBranch,
  getCommits,
  getDiffCommits,
  isGitRepo
};
