const { executeScript } = require("./cmd.cjs");

function cloneRepo(id) {
  return executeScript("glab/repo_clone", {
    args: id
  });
}

module.exports = { cloneRepo };
