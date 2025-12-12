import { Jira } from "@jira";
import { Config, ConfigError } from "@lib/config";

import { Task } from "./task";
import { TaskTracker } from "./task_tracker";

export class JiraIssueTracker extends TaskTracker {

  override isTracked(task: Task) {
    const todoLine = task.getTodo();
    const regex = /TODO[^:]*\([^)]*\)[^:]*:/;
    return regex.test(todoLine);
  }

  override addIdToTodo(id: string) {
    return `(${id})`;
  }

  override async generateId(task: Task) {
    const config = Config.get();
    const jira = new Jira();
    const parent_key = config.tasks.jira_parent_key;
    const project_key = config.jira.project_key;
    const labels = config.jira.labels;
    if (!parent_key) throw new ConfigError("tasks.jira_parent_key");
    if (!project_key) throw new ConfigError("jira.project_key");
    const parent_issue = await jira.getIssue(parent_key);
    const created_issue = await parent_issue.createChild({
      issueType: "Tarea",
      asignee: await jira.getCurrentUser(),
      reporter: await jira.getCurrentUser(),
      project: await jira.getProject(project_key),
      title: `TODO(${task.project}): ${task.title}`,
      description: `- FILE-LOCATION: ${task.file_location.file_path}:${task.file_location.row}:${task.file_location.col}
${task.description ?? ""}`,
      labels
    });
    return created_issue.key;
  }

}
