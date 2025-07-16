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
