const { executeScript } = require("../lib/cmd.cjs");

function getIssues(labels) {
  return executeScript("jira/list", {
    args: labels.map((l) => `-l${l}`),
    supressStdout: true
  });
}

module.exports = { getIssues };
