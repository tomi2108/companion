#!/usr/bin/env node

import yargs from "yargs";

import app from "@cli/app";
import config from "@cli/config";
import deploy from "@cli/deploy";
import env from "@cli/env";
import mr from "@cli/mr";
import pipeline from "@cli/pipeline";
import pod from "@cli/pod";
import repos from "@cli/repos";
import route from "@cli/route";
import ticket from "@cli/ticket";
import upgrade from "@cli/upgrade";
import { Config } from "@lib/config";

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
