#!/usr/bin/env node

import yargs from "yargs";

import app from "@cli/app/index";
import config from "@cli/config/index";
import deploy from "@cli/deploy";
import env from "@cli/env/index";
import mr from "@cli/mr/index";
import pipeline from "@cli/pipeline";
import pod from "@cli/pod/index";
import repos from "@cli/repos/index";
import route from "@cli/route/index";
import ticket from "@cli/ticket/index";
import upgrade from "@cli/upgrade";

import { initLogger, loadConfig } from "./middleware";

yargs
  .scriptName("companion")
  .usage("$0 <command> [subcommand]")
  .boolean("debug")
  .describe("debug", "Run on debug mode")
  .boolean("prod")
  .alias("prod", ["p"])
  .describe("prod", "Wheter to use the production servers")
  .middleware(loadConfig, true)
  .middleware(initLogger)
  .command(app)
  .command(config)
  .command(env)
  .command(pod)
  .command(route)
  .command(repos)
  .command(ticket)
  .command(mr)
  .command(deploy)
  .command(pipeline)
  .command(upgrade)
  .demandCommand(1, "Please specify a command")
  .strict()
  .help()
  .parse();
