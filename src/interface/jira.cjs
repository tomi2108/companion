const config = require("../lib/config.cjs");
const { executeScript } = require("./cmd.cjs");
const axios = require("axios");
const Jira = require("jira-client");

const jira = () => new Jira({
  host: config.jira.server,
  protocol: "https",
  username: config.jira.username,
  password: config.jira.token
});

function formatLabels(labels) {
  return labels.map((l) => `-l${l}`);
}

function getEpics() {
  // TODO: Should only fetch Epic issues
  // maybe we need labels here ? but in movistar-empresas
  // parent issues ("Features") do not have labels, at least no the ones listed in the config
  // maybe Feature does not apply for every team, could be a config
  return getIssues({ type: "Feature" });
}

async function getProject() {
  return await jira().getProject(config.jira.project_key);
}

async function getBoard() {
  return await jira().getBoard(config.jira.board_id);
}

async function getIssues({ labels, type } = { labels: [] }) {
  const board = await getBoard();

  let query = `${type ? `issuetype=${type}` : ""}`;
  if (labels.length > 0) {
    if (type) query += " AND ";
    query += `labels in (${labels})`;
  }

  const { issues } = await jira().getIssuesForBoard(
    board.id,
    0,
    100,
    query,
    true,
    ["key", "summary", "issuetype", "status"]
  );
  return issues.map((i) => ({
    id: i.id,
    key: i.key,
    type: i.fields.issuetype.name,
    status: i.fields.status.name,
    description: i.fields.summary
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
  getProject
};
