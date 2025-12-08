import { getTasksFromFile } from "@interface/tasks";

export default {
  command: "list",
  aliases: [],
  describe: "List tasks",
  handler: async () => {
    console.log(getTasksFromFile(""));
  }
};
