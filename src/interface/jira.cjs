const { executeScript } = require("./cmd.cjs");

function formatLabels(labels) {
  return labels.map((l) => `-l${l}`);
}

function formatIssues(issues) {
  return issues.split("\n").map(stringToIssue).filter((i) => Boolean(i.key));
}

function getEpics() {
  // TODO: Should only fetch Epic issues
  // maybe we need labels here ? but in movistar-empresas
  // parent issues ("Features") do not have labels, at least no the ones listed in the config
  // maybe Feature does not apply for every team, could be a config
  return getIssues({ type: "Feature" });
}

function getIssues({ labels = [], type }) {
  return formatIssues(
    executeScript("jira/list", {
      args: [type ?? "", ...formatLabels(labels)],
      supressStdout: true
    }));
}

function editIssue(issue_key) {
  return executeScript("jira/edit", {
    args: [issue_key]
  });
}

function deleteIssue(issue_key) {
  return executeScript("jira/delete", {
    args: [issue_key]
  });
}

function commentIssue(issue_key) {
  return executeScript("jira/comment", {
    args: [issue_key]
  });
}

function moveIssue(issue_key) {
  return executeScript("jira/move", {
    args: [issue_key]
  });
}

function viewIssue(issue_key) {
  return executeScript("jira/view", {
    args: [issue_key]
  });
}

function openIssue(issue_key) {
  return executeScript("jira/open", {
    args: [issue_key]
  });
}

function linkIssues(issue_key, issue2_key) {
  return executeScript("jira/link", {
    args: [issue_key, issue2_key]
  });
}

function unlinkIssues(issue_key, issue2_key) {
  return executeScript("jira/unlink", {
    args: [issue_key, issue2_key]
  });
}

function getUsers() {
  return JSON.parse(executeScript("jira/get_users", { supressStdout: true })).map((u) => u.displayName);
}

function createIssue(parent_issue, labels = []) {
  return executeScript("jira/create", {
    args: [parent_issue, ...formatLabels(labels)]
  });
}

function assignIssue(issue_key, user) {
  return executeScript("jira/assign", {
    args: [issue_key, user]
  });
}

function estimateIssue(issue_key, estimacion) {
  return executeScript("jira/estimate", {
    args: [issue_key, estimacion]
  });
}

function stringToIssue(issueString) {
  const splitted = issueString.split("\t").filter((s) => Boolean(s));
  const type = splitted[0];
  const key = splitted[1];
  const description = splitted[2];
  const status = splitted[3];
  return { key, description, type, status };
}

function issueToString(i) {
  return `[${i.type}] ${i.key} ${i.description}`;
}

module.exports = {
  commentIssue,
  createIssue,
  deleteIssue,
  editIssue,
  getEpics,
  getIssues,
  moveIssue,
  openIssue,
  viewIssue,
  issueToString,
  linkIssues,
  unlinkIssues,
  getUsers,
  assignIssue,
  estimateIssue
};
