
import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { Command } from "@lib/index";
import { PromptForPlugin } from "@workflow/steps/plugins/PromptForPlugin";

export const EnableCommand: Command = {
  name: "enable",
  description: "Enable a plugin",
  aliases: ["e"],
  run: async () => {
    const ctx = ExecutionContext.get();
    const log = ctx.logger;
    const config = Config.getView();
    const disabled = config.get("plugins.disabled") as string[];

    const { plugin } = await new PromptForPlugin({ enabled: false, message: "Choose plugin to enable" }).run(ctx);

    if (!disabled.includes(plugin.name)) {
      return log.warning("Plugin already enabled");
    }

    const configFile = Config.file();
    configFile.writePartial({
      plugins: {
        disabled: disabled.filter((d) => d !== plugin.name)
      }
    });
  }
};

