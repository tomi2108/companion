const { executeScript } = require("./cmd.cjs");

class Issue {

  static formatLabels(labels) {
    return labels.map((l) => `-l${l}`);
  }

  constructor({ key, id, type, status, description }) {
    this.key = key;
    this.id = id;
    this.type = type;
    this.status = status;
    this.description = description;
  }

  edit() {
    return executeScript("jira/edit", {
      args: [this.key]
    });
  }

  delete() {
    return executeScript("jira/delete", {
      args: [this.key]
    });
  }

  comment() {
    return executeScript("jira/comment", {
      args: [this.key]
    });
  }

  transition() {
    return executeScript("jira/move", {
      args: [this.key]
    });
  }

  view() {
    return executeScript("jira/view", {
      args: [this.key]
    });
  }

  openInBrowser() {
    return executeScript("jira/open", {
      args: [this.key]
    });
  }

  link(issue) {
    return executeScript("jira/link", {
      args: [this.key, issue.key]
    });
  }

  unlink(issue) {
    return executeScript("jira/unlink", {
      args: [this.key, issue.key]
    });
  }

  createChild(labels = []) {
    return executeScript("jira/create", {
      args: [this.key, ...Issue.formatLabels(labels)]
    });
  }

  assign(user) {
    return executeScript("jira/assign", {
      args: [this.key, user.name]
    });
  }

  estimate(estimacion) {
    return executeScript("jira/estimate", {
      args: [this.key, estimacion]
    });
  }
}

module.exports = { Issue };
