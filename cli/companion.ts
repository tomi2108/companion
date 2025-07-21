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
import { Config } from "@lib/config";
import { storage } from "@lib/log";

yargs
  .scriptName("companion")
  .usage("$0 <command> [subcommand]")
  .boolean("debug")
  .describe("debug", "Run on debug mode")
  .boolean("prod")
  .alias("prod", ["p"])
  .describe("prod", "Wheter to use the production servers")
  .middleware(async ({ prod }: { prod?: boolean }) => {
    await Config.get().load();

    if (prod) {
      Config.get().openshift.server_cuyo = "api.ocpprod.cuyorh.tcloud.ar:6443";
      Config.get().openshift.auth_server_cuyo = "https://oauth-openshift.apps.ocpprod.cuyorh.tcloud.ar";
    }
  }, true)
  .middleware(({ $0, _: args, debug }) => {
    const command = `${$0} ${args.join(" ")}`;
    const startTime = new Date().getTime();
    storage.enterWith({ command, startTime, debug: debug ?? false });
  })
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
