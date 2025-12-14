import { Repo } from "@interface/dirs/repo";

import { Task } from "./task";
import { TaskTracker } from "./task_tracker";

export class GitLabIssueTracker extends TaskTracker {
  repo: Repo;

  constructor(repo: Repo) {
    super();
    this.repo = repo;
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
    const relative = task.getPathInProject();
    const issue = await this.repo.createIssue({
      title: `TODO(${task.project.name()}): ${task.title}`,
      description: `- FILE-LOCATION: ${relative}:${task.file_location.row}:${task.file_location.col}
${task.description ?? ""}`
    });
    return issue.web_url;
  }

}
