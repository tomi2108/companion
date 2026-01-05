import { Config } from "@lib/config";

export default {
  command: "setup",
  aliases: [],
  describe: "Setup rishi",
  handler: async () => {
    await Config.get().setup();
  }
};
