import GenerateCommand from "@cli/route/generate";
import TestRouteCommand from "@cli/route/test";
import { Command } from "@lib/index";

const RouteCommands: Command = {
  name: "route",
  description: "Manage OpenShift routes",
  aliases: [],
  subcommands: [
    GenerateCommand,
    TestRouteCommand
  ]
};

export default RouteCommands;
