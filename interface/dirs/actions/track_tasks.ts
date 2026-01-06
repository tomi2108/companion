import { Repo } from "@interface/dirs/repo";
import { getTasksFromDir } from "@interface/tasks";
import { TaskTracker } from "@interface/tasks/trackers/task_tracker";

import { RepoAction } from ".";

export class CreateMissingTasksAction extends RepoAction {
  tracker: TaskTracker;

  constructor(tracker: TaskTracker) {
    super();
    this.tracker = tracker;
  }

  async onMrCreate(repo: Repo) {
    const spinner = this.ui.loading("Generate missing issues");
    const tasks = getTasksFromDir(repo.dir);
    if (
      tasks.length === 0 || tasks.every((t) => this.tracker.isTracked(t))
    ) return;

    await Promise.all(
      tasks.map(async (t) => {
        await this.tracker.track(t);
        await repo.add(t.file_location.file);
      }));
    await repo.commit("fix: add issues");
    spinner.succeed();
  }

}
