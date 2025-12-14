import { TempFile } from "@files/temp_file";

export default {
  command: "list",
  aliases: [],
  describe: "List tasks",
  handler: async () => {
    const temp = new TempFile({ ext: ".ts" });
    const prompt = await temp.prompt();
    console.log(prompt);
  }
};
