import { traverseDirectory } from "@files/utils";
import { getTasksFromFile } from "@interface/tasks";
import { Task } from "@interface/tasks/task";

export default {
  command: "list",
  aliases: [],
  describe: "List tasks",
  handler: async () => {
    const ignore = [
      ".git",
      "dist",
      "coverage",
      ".husky",
      ".next",
      "node_modules"
    ];

    const file_stats = traverseDirectory("/home/tsanchen/telefonica/companion", { flatten: true, ignore });
    const tasks: Task[] = [];
    for (const file_stat of file_stats) {
      tasks.push(...await getTasksFromFile(file_stat.path, { project: "companion" }));
    }
    console.log(tasks);
  }
};
