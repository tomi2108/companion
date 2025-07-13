import { Argv } from "yargs";

import download from "./pod/download";
import logs from "./pod/logs";
import remote_session from "./pod/remote_session";
import restart from "./pod/restart";

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
