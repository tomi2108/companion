import chalk from "chalk";
import path from "node:path";

import { JsonFile } from "@files/json_file";
import { Dir } from "@interface/dirs/dir";
import { ExecutionContext } from "@lib/ctx";

const configs_dir = path.resolve(__dirname, "../../../configs");

export class PresetLoader {
  static configs_dir = [new Dir(configs_dir)];

  static addConfigDir(dir: Dir) {
    this.configs_dir.push(dir);
  }

  private static getAvailablePresets() {
    const files = this.configs_dir.flatMap((d) => d.readFiles());
    return files
      .filter((f) => {
        const n = f.name();
        return !n.includes("example") && n.startsWith("config.") && n.endsWith("json");
      });
  }

  static load(preset?: string) {
    if (!preset) return {};
    const files = this.getAvailablePresets();
    const file = files.find((f) => f.name() === `config.${preset}.json`);
    if (!file) {
      console.log(chalk.red(`Unknown preset ${preset}, config might be incomplete !!! are you missing a plugin ????`));
      return {};
    }
    return new JsonFile(file.path).read() as Record<string, unknown>;
  }

  static async setup(ctx: ExecutionContext) {
    const presets = this.getAvailablePresets().map((p) => p.name());

    const preset = await ctx.ui.search({
      message: "Select a preset or default config",
      choices: [...presets, "default"]
    });
    return preset === "default" ? null : preset;
  }
}
