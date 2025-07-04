#!/usr/bin/env node

import yargs from "yargs";
import deploy from "./companion/deploy";
import env from "./companion/env";
import pipeline from "./companion/pipeline";
import pod from "./companion/pod";
import route from "./companion/route";
import repos from "./companion/repos";
import ticket from "./companion/ticket";
import config from "./companion/config";
import app from "./companion/app";
import upgrade from "./companion/upgrade";
import chat from "./companion/chat";
import mr from "./companion/mr";
import { Config } from "../lib/config";

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
  .command(chat)
  .demandCommand(1, "Please specify a command")
  .strict()
  .help()
  .parse();
