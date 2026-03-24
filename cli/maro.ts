#!/usr/bin/env node

import yargs from "yargs";

import { PluginRegistry } from "@lib/plugins/registry";

import {
  checkVersion,
  initConfig,
  initCtx,
  readPlugins,
  registerCore
} from "./middleware";

const parser = yargs
  .scriptName("maro")
  .usage("$0 <command> [subcommand]")
  .boolean("debug")
  .describe("debug", "Run on debug mode")
  .boolean("prod")
  .describe("prod", "Whether to use the production servers")
  .string("log")
  .alias("log", ["l"])
  .describe("log", "Set log file path")
  .string("config")
  .alias("config", ["c"])
  .describe("config", "Set config file path");

const earlyArgv = parser.parseSync();
const configPath = earlyArgv.config ?? earlyArgv.c;

(async () => {
  await initConfig({ config: configPath });
  const registry = new PluginRegistry();
  await registerCore(registry);
  await readPlugins(registry, { config: configPath });

  await parser
    .middleware(initCtx)
    .middleware(checkVersion)
    .demandCommand(1, "Please specify a command")
    .strict()
    .help()
    .parse();
})();
