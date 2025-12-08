import { TaskRepo } from "@files/task_repo";
import { Task } from "@interface/tasks/task";
import { Config, ConfigError } from "@lib/config";

export default {
  command: "list",
  aliases: [],
  describe: "List tasks",
  handler: async () => {
    const tasks_path = Config.get().paths.tasks;
    if (!tasks_path) throw new ConfigError("paths.tasks");

    const repo = new TaskRepo(tasks_path);
    // const tasks = await repo.getTasks();
    const task = new Task({
      title: "refactor function",
      id: "123123",
      project: "movistarempresas-dao-mis-ordenes",
      tags: {
        priority: 21,
        status: "OPEN",
        file_location: { file_path: "src/asdaskda.ts", col: 1, row: 12 }
      }
    });
    repo.addTask(task);
    // const task = new Task("movistarempresas-dao-mis-ordenes");
  }
};
