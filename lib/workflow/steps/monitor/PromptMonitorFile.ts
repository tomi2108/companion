import { Dir } from "@files/dir";
import { MonitorYaml } from "@files/monitor_yaml";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = {};
type Writes = { monitor_file: MonitorYaml };
type Options = {};

export class PromptMonitorFile extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext) {
    new ValidateConfig({ keys: ["paths.monitors"] }).run(ctx);
    const monitors_path = ctx.config.paths.monitors;
    const dirs = new Dir(monitors_path!).readDirs();
    const dir = await ctx.ui.promptChoice(dirs, { message: "Choose namespace" });
    const files = dir.readFiles().map((f) => new MonitorYaml(f.path));
    const monitor_file = await ctx.ui.promptChoice(files, { message: "Choose file" });
    return { monitor_file };
  }
}
