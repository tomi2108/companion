import path from "node:path";

import { Repo } from "@interface/dirs/repo";
import { Task } from "@interface/tasks/task";
import { readdirs } from "@lib/utils";

import { createDirIfNotExists } from "../files/utils";

const TASK_FILE = "TASK.md";

export class TaskRepo extends Repo {
  constructor(full_path: string) {
    super(full_path);
  }

  async getTasks(project?: string) {
    await this.update();
    const dirs = project ? [project] : readdirs(this.full_path).map((d) => d.name);
    const full_dirs = dirs.map((d) => path.join(this.full_path, d));
    return full_dirs.flatMap((d) => readdirs(d).map((task_dir) => Task.fromTaskFile(path.join(d, task_dir.name, TASK_FILE))));
  }

  addTask(task: Task) {
    const dir = path.join(this.full_path, task.project, task.id);
    const task_path = path.join(dir, TASK_FILE);
    createDirIfNotExists(dir);
    task.save(task_path);
  }
}
