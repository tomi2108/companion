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

module.exports = { getTags, cloneRepo };
