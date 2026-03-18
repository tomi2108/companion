import { cwd } from "node:process";

import { Dir } from "@interface/dirs/dir";
import { GitProvider } from "@interface/git/provider";
import { Config } from "@lib/config";
import { registerLoadingAdapter } from "@lib/decorators/ui";
import { Logger } from "@lib/log";
import { UI } from "@lib/ui";

import { GitProviderFactory } from "./git_provider";

type Options = {
  ui: UI;
  logger: Logger;
};

export class ExecutionContext {
  static ctx: ExecutionContext | null = null;
  logger: Logger;
  ui: UI;
  cwd = new Dir(cwd());
  env = process.env;
  gitProvider: GitProvider;

  private constructor(opts: Options) {
    this.ui = opts.ui;
    this.logger = opts.logger;
    registerLoadingAdapter(this.ui);
    const config = Config.getView();
    this.gitProvider = GitProviderFactory.getProvider(config);
  }

  static bootstrap(opts: Options) {
    if (this.ctx) throw new Error("ExecutionContext already initialized");
    this.ctx = new ExecutionContext(opts);
    return this.ctx;
  }

  static get() {
    if (!this.ctx) throw new Error("ExecutionContext not initialized");
    return this.ctx;
  }

}

