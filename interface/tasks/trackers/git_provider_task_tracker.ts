// TODO(20260318-002455): probably move to maro-plugin-git-providers
// import { RepoWithGitProvider } from "@interface/dirs/withProvider";
//
// import { Task } from "../task";
// import { TaskTracker } from "./task_tracker";
//
// export class GitLabTaskTracker extends TaskTracker {
//   repo: RepoWithGitProvider;
//
//   constructor(repo: RepoWithGitProvider) {
//     super();
//     this.repo = repo;
//   }
//
//   override isTracked(task: Task) {
//     const todoLine = task.getTodo();
//     const regex = /TODO[^(20260318-002459): ]*\[[^\]]*\][^:]*:/;
//     return regex.test(todoLine);
//   }
//
//   override addIdToTodo(id: string) {
//     return `[${id}]`;
//   }
//
//   override async save(task: Task) {
//     const relative = task.getPathInProject();
//     const issue = await this.repo.createIssue({
//       title: `TODO(${task.project.name()}): ${task.title}`,
//       description: `- FILE-LOCATION: ${relative}:${task.file_location.row}:${task.file_location.col}
// ${task.description ?? ""}`
//     });
//     return issue.web_url;
//   }
//
// }