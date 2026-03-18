
import { Dir } from "@interface/dirs/dir";
import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { Plugin } from "@lib/plugins/plugin";
import { PluginRegistry } from "@lib/plugins/registry";

import { WorkflowStep } from "..";

type Reads = {};
type Writes = { plugin: Plugin };
type Options = {
  message?: string;
  enabled?: boolean;
};

export class PromptForPlugin extends WorkflowStep<Reads, Writes, Options> {
  async run(ctx: ExecutionContext) {
    const ui = ctx.ui;
    const config = Config.getView();
    const disabled = config.get("plugins.disabled");
    const dir = config.get("plugins.dir");
    const plugins = await new PluginRegistry().readDir(new Dir(dir));
    const choices = (() => {
      if (this.options?.enabled === undefined) return plugins;
      if (this.options.enabled) return plugins.filter((p) => !disabled.includes(p.name));
      return plugins.filter((p) => disabled.includes(p.name));
    })();

    const plugin = await ui.promptChoice(choices, { message: this.options?.message ?? "Choose plugin" });
    return { plugin };
  }
}
