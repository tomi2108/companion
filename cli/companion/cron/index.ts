import { Argv } from "yargs";

import create from "@cli/cron/create";
import deploy from "@cli/cron/deploy";

export default {
  command: "cron <command>",
  describe: "Manage CronJobs",
  aliases: ["envs"],
  builder: (yargs: Argv) => yargs
    .command(create)
    .command(deploy)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
