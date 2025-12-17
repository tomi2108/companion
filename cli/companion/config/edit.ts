import { JsonFile } from "@files/json_file";
import { getConfigPath } from "@lib/config";
import { openInEditor } from "@lib/editor";

export default {
  command: "edit",
  aliases: ["o", "open", "e"],
  describe: "Edit config in editor",
  handler: async () => {
    openInEditor(new JsonFile(getConfigPath()));
  }
};
