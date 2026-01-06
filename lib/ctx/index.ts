import { cwd } from "node:process";

import { Dir } from "@files/dir";
import { FileNotFound, InvalidJsonFile } from "@files/errors";
import { Config } from "@lib/config";
import { Logger } from "@lib/log";
import { DebugLogger } from "@lib/log/debug";
import { DefaultLogger } from "@lib/log/default";
import { UI } from "@lib/ui";
import { DefaultUI } from "@lib/ui/default";

export class ExecutionContext {
  static ctx: ExecutionContext | null = null;
  config: Config = Config.get();
  logger: Logger = new DefaultLogger();
  ui: UI = new DefaultUI();
  cwd: Dir = new Dir(cwd());
  // TODO: check everywhere for process.env and replace
  env: NodeJS.ProcessEnv = process.env;
  prod: boolean = false;
  debug: boolean = false;

  static get() {
    if (this.ctx === null) this.ctx = new ExecutionContext();
    return this.ctx;
  }

  async load() {
    try {
      await this.config.load();
    } catch (err) {
      if (
        err instanceof InvalidJsonFile
        || err instanceof FileNotFound
      ) return await this.config.create(this);
      else throw err;
    }
  }

  setDebug() {
    this.debug = true;
    this.logger = new DebugLogger();
  }

  async setProd() {
    this.prod = true;
    await this.config.prod();
  }

  private constructor() { }
}
