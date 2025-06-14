#!/usr/bin/env node

import yargs from "yargs";
import deploy from "./companion/deploy";
import env from "./companion/env";
import pipeline from "./companion/pipeline";
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
  }, true)
  .command(env)
  .command(pod)
  .command(route)
  .command(repos)
  .command(ticket)
  .command(mr)
  .command(deploy)
  .command(pipeline)
  .command(setup)
  .command(upgrade)
  .demandCommand(1, "Please specify a command")
  .strict()
  .help()
  .parse();
