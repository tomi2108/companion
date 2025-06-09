const config = require("../lib/config.cjs");
const { search } = require("../lib/ui.cjs");
const { readdirs } = require("../lib/utils.cjs");
const { getApp } = require("./files.cjs");
const { getIssues } = require("./jira.cjs");
const { getProjects, getItemNamesFromResource } = require("./oc.cjs");

async function promptForApp(promptOpts) {
  const opts = promptOpts || {};
  const apps = readdirs(config.paths.despliegues);
  const app_name = await search({ choices: apps, ...opts });
  return await getApp(app_name);
}

async function promptForOcProject(promptOpts) {
  const opts = promptOpts || {};
  const projects = getProjects();
  const project = await search({ choices: getItemNamesFromResource(projects), ...opts });
  if (!project) return process.exit(1);
  return project;
}

async function promptForOcResource(resources, promptOpts) {
  const opts = promptOpts || {};
  const resource = await search({ choices: getItemNamesFromResource(resources), opts });
  if (!resource) return process.exit(1);
  return resources.items.find((r) => r.metadata.name === resource);
}

async function promptForJiraIssue(promptOpts, issueOpts) {
  const pOpts = promptOpts || {};
  const iOpts = issueOpts || {};

  const issues = getIssues({ labels: config.jira.labels, ...iOpts });
  const choices = issues.map((i) => ({ name: i.key, hint: `[${i.type}] (${i.status}) ${i.description}` }));
  const issue = await search({
    choices,
    suggest: (input, choices) =>
      choices.filter(
        (c) =>
          c.message.toLowerCase().includes(input.toLowerCase())
          || c.hint.toLowerCase().includes(input.toLowerCase())
      ),
    ...pOpts
  });
  if (!issue) return process.exit(1);
  return issue;
}

module.exports = { promptForApp, promptForOcProject, promptForOcResource, promptForJiraIssue };
