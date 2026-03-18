import { JsonFile } from "@files/json_file";
import { getConfigPath } from "@lib/config/loader";
import { openInEditor } from "@lib/editor";
import { Command } from "@lib/index";

const EditCommand: Command = {
  name: "edit",
  aliases: ["o", "open", "e"],
  description: "Edit config in editor",
  run: async () => {
    openInEditor(new JsonFile(getConfigPath()));
  }
};

export default EditCommand;
