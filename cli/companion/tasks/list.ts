import { Dir } from "@files/dir";
import { getTasksFromDir } from "@interface/tasks";

export default {
  command: "list",
  aliases: [],
  describe: "List tasks",
  handler: async () => {
    const dir = new Dir("/home/tsanchen/telefonica/companion");
    const tasks = getTasksFromDir(dir);
    const task = tasks[3];
    console.log(task);
    task?.openInEditor();
    console.log(tasks);
  }
};
