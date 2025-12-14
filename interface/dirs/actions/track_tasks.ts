import { Repo } from "@interface/dirs/repo";
import { getTasksFromDir } from "@interface/tasks";
import { TaskTracker } from "@interface/tasks/task_tracker";
import { loading } from "@lib/ui";

import { RepoAction } from ".";

export class TrackTasksAction implements RepoAction {
  tracker: TaskTracker;

  constructor(tracker: TaskTracker) {
    this.tracker = tracker;
  }

  async onMrCreate(repo: Repo) {
    const spinner = loading("Generate missing issues");
    const tasks = getTasksFromDir(repo.dir);
    if (
      tasks.length === 0 || tasks.every((t) => this.tracker.isTracked(t))
    ) return;

    await Promise.all(
      tasks.map(async (t) => {
        await this.tracker.save(t);
        await repo.add(t.file_location.file);
      }));
    await repo.commit("fix: add issues");
    spinner.succeed();
  }

}
