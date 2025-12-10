import path from "node:path";

import { MonitorYaml } from "@files/monitor_yaml";
import { Jira } from "@jira";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log";
import { search } from "@lib/ui";
import { readdirs, readfiles } from "@lib/utils";

export default {
  command: "doc",
  aliases: ["d"],
  describe: "Genera el documento de alta de monitor para subir a Jira",
  handler: async () => {
    const config = Config.get();
    const monitors_path = config.paths.monitors;
    const project_key = config.jira.monitors_project_key;
    const parent_issue_key = config.jira.monitors_parent_issue_key;

    if (!monitors_path) throw new ConfigError("paths.monitors");
    if (!project_key) throw new ConfigError("jira.monitors_project_key");
    if (!parent_issue_key) throw new ConfigError("jira.monitors_parent_issue_key");

    const namespaces = readdirs(monitors_path);

    const namespace = await search({
      choices: namespaces.map((d) => d.name),
      message: "Selecciona entorno(s): Space para marcar, Enter para confirmar"
    });
    const dir = path.join(monitors_path, namespace);
    const files = readfiles(dir)
      .filter((e) => e.toLowerCase().endsWith(".yaml"))
      .sort((a, b) => a.localeCompare(b));

    if (files.length === 0) return log.error(`No hay archivos .yaml en: ${dir}`);

    const file = await search({
      choices: files,
      message: "Selecciona YAML(s) a convertir (Space para marcar, Enter para confirmar)"
    });

    const full_path = path.join(dir, file);
    const yaml = new MonitorYaml(full_path);
    await createMonitorIssue(yaml, { project_key, parent_issue_key });
  }
};

export async function createMonitorIssue(yaml: MonitorYaml, {
  project_key,
  parent_issue_key
}: { project_key: string; parent_issue_key: string }) {
  const doc = yaml.toString();

  const jira = new Jira();
  const reporter = await jira.getCurrentUser();
  const project = await jira.getProject(project_key);
  const issue = await jira.getIssue(parent_issue_key);
  issue.createChild({
    project,
    issueType: "Story",
    title: `NUEVO - ${yaml.content.name}`,
    description: doc,
    reporter,
    labels: ["MONITOR"]
  });
}

