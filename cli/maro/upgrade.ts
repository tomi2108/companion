import { Dir } from "@interface/dirs/dir";
import { CommandRunner } from "@interface/process/runner";
import { root } from "@lib/config/preferences";
import { Command } from "@lib/index";

const UpgradeCommand: Command = {
  name: "upgrade",
  aliases: ["up"],
  description: "Upgrade maro",
  run: async () => {
    const full_path = new Dir(root).prev();
    await new CommandRunner().run(
      "./install.sh",
      [],
      { cwd: full_path }
    );
  }
};

export default UpgradeCommand;
