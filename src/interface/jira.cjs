const config = require("../lib/config.cjs");
const axios = require("axios");
const JiraCli = require("jira-client");
const { Issue } = require("./issue.cjs");

class Jira {

  constructor() {
    this.jira = new JiraCli({
      host: config.jira.server,
      protocol: "https",
      username: config.jira.username,
      password: config.jira.token
    });

    const string = `${config.jira.username}:${config.jira.token}`;
    const encodedString = Buffer.from(string).toString("base64");
    this.api = axios.create({
      headers: { Authorization: `Basic ${encodedString}` }
    });
  }

  async getUsers() {
    const params = { project: config.jira.project_key, maxResults: 1000 };
    const res = await this.instance.get(`https://${config.jira.server}/rest/api/3/user/assignable/search`, { params });
    return res.data.map((u) => ({ name: u.displayName, email: u.emailAddress }));
  }

  getEpics() {
    // TODO: Should only fetch Epic issues
    // maybe we need labels here ? but in movistar-empresas
    // parent issues ("Features") do not have labels, at least no the ones listed in the config
    return this.getIssues({ type: "Feature" });
  }

  async getProject() {
    return await this.jira.getProject(config.jira.project_key);
  }

  async getBoard() {
    return await this.jira.getBoard(config.jira.board_id);
  }

  async getIssues({ labels, type } = { labels: [] }) {
    const board = await this.getBoard();

    let query = `${type ? `issuetype=${type}` : ""}`;
    if (labels.length > 0) {
      if (type) query += " AND ";
      query += `labels in (${labels})`;
    }

    const { issues } = await this.jira.getIssuesForBoard(
      board.id,
      0,
      100,
      query,
      true,
      ["key", "summary", "issuetype", "status"]
    );
    return issues.map((i) => new Issue({
      id: i.id,
      key: i.key,
      type: i.fields.issuetype.name,
      status: i.fields.status.name,
      description: i.fields.summary
    }));
  }
}

module.exports = { Jira };
