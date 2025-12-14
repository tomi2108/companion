import { Repo } from "@interface/dirs/repo";
import { getTasksFromDir } from "@interface/tasks";
import { JiraIssueTracker } from "@interface/tasks/jira_issue_tracker";
import { loading } from "@lib/ui";

import { RepoAction } from ".";

export class GenerateJiraTicketsAction implements RepoAction {
  tracker = new JiraIssueTracker();

  async onMrCreate(repo: Repo) {
    const spinner = loading("Generate missing jira tickets");
    const tasks = getTasksFromDir(repo.dir);
    if (
      tasks.length === 0 || tasks.every((t) => this.tracker.isTracked(t))
    ) return;

    await Promise.all(
      tasks.map(async (t) => {
        await this.tracker.save(t);
        await repo.add(t.file_location.file);
      }));
    await repo.commit("fix: add jira tickets");
    spinner.succeed();
  }

}
