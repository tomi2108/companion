#!/usr/bin/env node

import yargs from "yargs";
import { setup as setupApp } from "../lib/setup";
import deployment from "./companion/deployment";
import env from "./companion/env";
import pod from "./companion/pod";
import route from "./companion/route";
import repos from "./companion/repos";
import ticket from "./companion/ticket";
import setup from "./companion/setup";
import upgrade from "./companion/upgrade";
import mr from "./companion/mr";
import { Config } from "../lib/config";

yargs
  .scriptName("companion")
  .usage("$0 <command> [subcommand]")
  .middleware(async () => {
    await Config.get().load();
    setupApp();
  }, true)
  .command(deployment)
  .command(env)
  .command(pod)
  .command(route)
  .command(repos)
  .command(ticket)
  .command(setup)
  .command(upgrade)
  .command(mr)
  .demandCommand(1, "Please specify a command")
  .strict()
  .help()
  .parse();
