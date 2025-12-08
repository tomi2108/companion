import { TaskRepo } from "@files/task_repo";
import { Config, ConfigError } from "@lib/config";

export default {
  command: "list",
  aliases: [],
  describe: "List tasks",
  handler: async () => {
    const tasks_path = Config.get().paths.tasks;
    if (!tasks_path) throw new ConfigError("paths.tasks");

    const repo = new TaskRepo(tasks_path);
    const tasks = await repo.getTasks();
    // const task = new Task("movistarempresas-dao-mis-ordenes");

    console.log(tasks);
    console.log(tasks.map((t) => t.toString()).join("\n"));
  }
};
