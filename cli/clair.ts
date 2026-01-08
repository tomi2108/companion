#!/usr/bin/env node

import yargs from "yargs";

import app from "@cli/app";
import config from "@cli/config";
import cron from "@cli/cron";
import debug from "@cli/debug";
import env from "@cli/env";
import http from "@cli/http";
import mongo from "@cli/mongo";
import monitors from "@cli/monitors";
import mr from "@cli/mr";
import pod from "@cli/pod";
import project from "@cli/project";
import repos from "@cli/repos";
import route from "@cli/route";
import upgrade from "@cli/upgrade";

import { checkVersion, loadExecutionContext } from "./middleware";

yargs
  .scriptName("clair")
  .usage("$0 <command> [subcommand]")
  .boolean("debug")
  .describe("debug", "Run on debug mode")
  .boolean("prod")
  .alias("prod", ["p"])
  .describe("prod", "Wheter to use the production servers")
  .middleware(loadExecutionContext, true)
  .middleware(checkVersion)
  .command(app)
  .command(config)
  .command(cron)
  .command(env)
  .command(http)
  .command(mongo)
  .command(monitors)
  .command(mr)
  .command(pod)
  .command(project)
  .command(repos)
  .command(route)
  .command(upgrade)
  .command(debug)
  .demandCommand(1, "Please specify a command")
  .strict()
  .help()
  .parse();
