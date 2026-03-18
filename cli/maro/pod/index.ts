import DownloadLogsCommand from "@cli/pod/download";
import LogsCommand from "@cli/pod/logs";
import MetricsCommand from "@cli/pod/metrics";
import RemoteSessionCommand from "@cli/pod/remote_session";
import RestartCommand from "@cli/pod/restart";
import ExecCommand from "@cli/pod/exec";
import { Command } from "@lib/index";

const PodCommands: Command = {
  name: "pod",
  description: "Manage OpenShift pods",
  aliases: ["pods"],
  subcommands: [
    DownloadLogsCommand,
    LogsCommand,
    MetricsCommand,
    RemoteSessionCommand,
    RestartCommand,
    ExecCommand,
  ]
};

export default PodCommands;
