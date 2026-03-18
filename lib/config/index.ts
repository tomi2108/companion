import { JsonFile } from "@files/json_file";
import { Dir } from "@interface/dirs/dir";
import { ExecutionContext } from "@lib/ctx";

import { ConfigLoader, getConfigPath } from "./loader";
import { PresetLoader } from "./preset";
import { ConfigRegistry } from "./registry";
import { ConfigView } from "./view";

export class Config {

  static async setup(ctx: ExecutionContext, path?: string) {
    let config_to_write: Record<string, any> = { team: PresetLoader.setup(ctx) };
    for (const section of ConfigRegistry.getSections()) {
      config_to_write = { ...config_to_write, ...await section.setup(ctx) };
    }

    const file = this.file(path);
    const dir = new Dir(file.dir());
    dir.create();
    file.write(config_to_write);
    const log = ctx.logger;
    log.success(`Configuration written to ${file}`);
  }

  static async create(path?: string) {
    const ctx = ExecutionContext.get();
    const log = ctx.logger;
    const ui = ctx.ui;
    log.warning("Configuration file config.json for maro was not found");
    const setup = await ui.confirm({ message: "Would you like to setup a config interactively?" });
    if (setup) await this.setup(ctx, path);
    process.exit(0);
  }

  static file(path?: string) {
    return new JsonFile(path ?? getConfigPath());
  }

  static async check(path?: string) {
    const file = this.file(path);
    if (!file.exists()) return await this.create(path);
  }

  static getView() {
    const userConfig = ConfigLoader.load();

    const team = "team" in userConfig
      && userConfig.team
      && typeof userConfig.team === "string"
      ? userConfig.team
      : undefined;

    const preset = PresetLoader.load(team);
    return new ConfigView(userConfig, preset);
  }

}

export class ConfigError extends Error {
  constructor(key: string) {
    const msg = `${key} not set`;
    const log = ExecutionContext.get().logger;
    log.error(`ConfigError: ${msg}`);
    super(msg);
  }
}

