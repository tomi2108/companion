import { Argv } from "yargs";

import download from "@cli/pod/download";
import logs from "@cli/pod/logs";
import remote_session from "@cli/pod/remote_session";
import restart from "@cli/pod/restart";

export default {
  command: "pod <command>",
  describe: "Manage OpenShift pods",
  aliases: ["pods"],
  builder: (yargs: Argv) => yargs
    .command(download)
    .command(logs)
    .command(remote_session)
    .command(restart)
    .demandCommand(1, "Please specify a command")
    .help(),
  handler: () => { }
};
