#!/usr/bin/env node

import { Config } from "@lib/config";
import yargs from "yargs";

import app from "./companion/app";
import config from "./companion/config";
import deploy from "./companion/deploy";
import env from "./companion/env";
import mr from "./companion/mr";
import pipeline from "./companion/pipeline";
import pod from "./companion/pod";
import repos from "./companion/repos";
import route from "./companion/route";
import ticket from "./companion/ticket";
import upgrade from "./companion/upgrade";

yargs
  .scriptName("companion")
  .usage("$0 <command> [subcommand]")
  .middleware(async () => {
    await Config.get().load();
  }, true)
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
