const gitCreate = require("simple-git");

async function getTags(full_path) {
  const git = gitCreate({ baseDir: full_path });
  const tags = await git.tags({ "--sort": "-v:refname" });
  return tags.all;
}

module.exports = { getTags };
