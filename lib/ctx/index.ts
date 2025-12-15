import { cwd } from "node:process";

import { Dir } from "@files/dir";
import { Config } from "@lib/config";
import { Logger } from "@lib/log";
import { DebugLogger } from "@lib/log/debug";
import { DefaultLogger } from "@lib/log/default";

export class ExecutionContext {
  static ctx: ExecutionContext | null = null;
  config: Config = Config.get();
  logger: Logger = new DefaultLogger();
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
    await this.config.load();
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
