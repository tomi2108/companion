import { Config } from "../../../lib/config";

export default {
  command: "edit",
  aliases: ["o", "open", "e"],
  describe: "Edit config in editor",
  handler: async () => {
    Config.get().open();
  }
};
