const { executeScript } = require("./cmd.cjs");

function cloneRepos(ids) {
  executeScript("glab/repo_clone", {
    args: ids
  });
}

module.exports = { cloneRepos };
