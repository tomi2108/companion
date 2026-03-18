import { Dir } from "@interface/dirs/dir";
import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { Command } from "@lib/index";
import { PluginInstaller } from "@lib/plugins/installer";

export const InstallCommand: Command = {
  name: "install",
  description: "Install maro plugin from git url",
  run: async () => {
    const ctx = ExecutionContext.get();
    const ui = ctx.ui;
    const config = Config.getView();
    const plugins_dir = config.get("plugins.dir");
    const disabled = config.get("plugins.disabled");
    const url = await ui.input({ message: "Input git url" });
    const dir = new Dir(plugins_dir);
    new PluginInstaller(dir, disabled).installFromGit(url);
  }
};
