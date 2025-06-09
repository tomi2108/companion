const { executeScript } = require("./cmd.cjs");

function cloneGroup(id, path) {
  return executeScript("glab/repo_clone", {
    args: [id, path]
  });
}

module.exports = { cloneGroup };
