const config = require("../lib/config.cjs");
const { executeScript } = require("./cmd.cjs");
const axios = require("axios");

function formatLabels(labels) {
  return labels.map((l) => `-l${l}`);
}

function formatIssues(issues) {
  return issues.split("\n").filter(Boolean).map(stringToIssue).filter((i) => Boolean(i.key));
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
      args: [type ?? "", ...formatLabels(labels)].filter(Boolean),
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

async function getUsers() {
  // TODO: probably get this out of here
  const string = `${config.jira.username}:${config.jira.token}`;
  const encodedString = Buffer.from(string).toString("base64");

  const headers = {
    Authorization: `Basic ${encodedString}`
  };
  const params = {
    project: config.jira.project_key,
    maxResults: 1000
  };
  const res = await axios.get(`https://${config.jira.server}/rest/api/3/user/assignable/search`, { headers, params });
  return res.data.map((u) => ({ name: u.displayName, email: u.emailAddress }));
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
  if (splitted.length === 0) return null;
  const type = splitted[0];
  const key = splitted[1];
  const description = splitted[2];
  const status = splitted[3];
  return { key, description, type, status };
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
  linkIssues,
  unlinkIssues,
  getUsers,
  assignIssue,
  estimateIssue,
  stringToIssue
};
