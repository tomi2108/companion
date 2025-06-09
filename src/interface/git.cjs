const gitCreate = require("simple-git");

async function getTags(full_path) {
  const git = gitCreate({ baseDir: full_path });
  await git.fetch(["--tags"]);
  const tags = await git.tags({ "--sort": "-v:refname" });
  return tags.all;
}

async function cloneRepo(link, full_path) {
  const git = gitCreate({ baseDir: full_path });
  await git.clone(link, full_path);
}

async function stash(full_path, callback) {
  const git = gitCreate({ baseDir: full_path });
  const { total: stash_before } = await git.stashList();
  await git.stash();
  const { total: stash_after } = await git.stashList();
  await callback();
  if (stash_after !== stash_before) await git.stash(["pop"]);
}

async function createNewBranch(full_path, name) {
  const git = gitCreate({ baseDir: full_path });
  try {
    await git.deleteLocalBranch(name, true);
  } catch { }
  await git.checkoutLocalBranch(name);
}

async function add(full_path, file) {
  const git = gitCreate({ baseDir: full_path });
  await git.add(file);
}

async function commit(full_path, message) {
  const git = gitCreate({ baseDir: full_path });
  await git.commit(message);
}

async function switchBranch(full_path, branch) {
  const git = gitCreate({ baseDir: full_path });
  await git.checkout(branch);
}

async function pull(full_path) {
  const git = gitCreate({ baseDir: full_path });
  await git.pull();
}

module.exports = {
  add,
  pull,
  getTags,
  commit,
  cloneRepo,
  stash,
  switchBranch,
  createNewBranch
};
