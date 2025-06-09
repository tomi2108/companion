const { executeScript } = require("./cmd.cjs");

function getIssues(labels) {
  return executeScript("jira/list", {
    args: labels,
    supressStdout: true
  });
}

module.exports = { getIssues };
