import { ExecutionContext } from "@lib/ctx";
import { Command } from "@lib/index";
import { PromptForPlugin } from "@workflow/steps/plugins/PromptForPlugin";

export const UninstallCommand: Command = {
  name: "uninstall",
  description: "Uninstall maro plugin from git url",
  run: async () => {
    const ctx = ExecutionContext.get();
    const { plugin } = await new PromptForPlugin({ message: "Choose plugin to uninstall" }).run(ctx);
    const plugin_dir = plugin.dir;
    plugin_dir.delete();
  }
};
