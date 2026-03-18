import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { Command } from "@lib/index";
import { PromptForPlugin } from "@workflow/steps/plugins/PromptForPlugin";

export const DisableCommand: Command = {
  name: "disable",
  description: "Disable a plugin",
  aliases: ["d"],
  run: async () => {
    const ctx = ExecutionContext.get();
    const log = ctx.logger;
    const config = Config.getView();
    const disabled = config.get("plugins.disabled");

    const { plugin } = await new PromptForPlugin({ enabled: true, message: "Choose plugin to disable" }).run(ctx);

    if (disabled.includes(plugin.name)) {
      return log.warning("Plugin already disabled");
    }

    const configFile = Config.file();
    configFile.writePartial({
      plugins: {
        disabled: [
          ...disabled,
          plugin.name
        ]
      }
    });
  }
};

