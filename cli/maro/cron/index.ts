import CreateCommand from "@cli/cron/create";
import DeployCommand from "@cli/cron/deploy";
import { Command } from "@lib/index";

import LogCommand from "./log";

const CronCommands: Command = {
  name: "cron",
  description: "Manage CronJobs",
  aliases: ["crn"],
  subcommands: [
    CreateCommand,
    DeployCommand,
    LogCommand
  ]
};

export default CronCommands;
