const { executeScript } = require("./cmd.cjs");

function getIssues(labels) {
  return executeScript("jira/list", {
    args: labels.map((l) => `-l${l}`),
    supressStdout: true
  }).split("\n").map(parseIssueString).filter((i) => Boolean(i.key));
}

function editIssue(issue_key) {
  return executeScript("jira/edit", {
    args: [issue_key]
  });
}

function parseIssueString(issueString) {
  const splitted = issueString.split("\t").filter((s) => Boolean(s));
  const type = splitted[0];
  const key = splitted[1];
  const description = splitted[2];
  const status = splitted[3];
  return { key, description, type, status };
}

module.exports = { getIssues, editIssue, parseIssueString };
