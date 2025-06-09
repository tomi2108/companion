const { executeScript } = require("./cmd.cjs");

function cloneGroup(id, path) {
  return executeScript("glab/clone", {
    args: [id, path]
  });
}

function createAndMergeMr(full_path, branch) {
  return executeScript("glab/merge", {
    args: [branch, full_path]
  });
}

module.exports = { cloneGroup, createAndMergeMr };
