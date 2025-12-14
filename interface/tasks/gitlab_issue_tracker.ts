import { Repo } from "@interface/dirs/repo";

import { Task } from "./task";
import { TaskTracker } from "./task_tracker";

export class GitLabIssueTracker extends TaskTracker {
  file_path: string;

  constructor(file_path: string) {
    super();
    this.file_path = file_path;
  }

  override isTracked(task: Task) {
    const todoLine = task.getTodo();
    const regex = /TODO[^:]*\[[^\]]*\][^:]*:/;
    return regex.test(todoLine);
  }

  override addIdToTodo(id: string) {
    return `[${id}]`;
  }

  override async generateId(task: Task) {
    const repo = new Repo(this.file_path);
    const relative = task.getPathInProject();
    const issue = await repo.createIssue({
      title: `TODO(${task.project.name()}): ${task.title}`,
      description: `- FILE-LOCATION: ${relative}:${task.file_location.row}:${task.file_location.col}
${task.description ?? ""}`
    });
    return issue.web_url;
  }

}
