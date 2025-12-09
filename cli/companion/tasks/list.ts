import { getAppPaths } from "@files";
import { AppRepo } from "@files/app_repo";
import { TaskRepo } from "@files/task_repo";
import { traverseDirectory } from "@files/utils";
import { getTasksFromFile } from "@interface/tasks";
import { Config, ConfigError } from "@lib/config";

export default {
  command: "list",
  aliases: [],
  describe: "List tasks",
  handler: async () => {
    const tasks_path = Config.get().paths.tasks;
    if (!tasks_path) throw new ConfigError("paths.tasks");
    const task_repo = new TaskRepo(tasks_path);

    const apps = getAppPaths();
    const ignore = [".git", "dist", "coverage", ".husky", ".next", "node_modules"];

    for (const app of apps) {
      const app_repo = new AppRepo(app);
      const { name } = await app_repo.getInfo();

      const file_stats = traverseDirectory(app_repo.full_path, { flatten: true, ignore });

      for (const file_stat of file_stats) {
        const tasks = await getTasksFromFile(file_stat.path, { project: name });
        tasks.forEach((t) => task_repo.addTask(t));
      }
    }
  }
};
