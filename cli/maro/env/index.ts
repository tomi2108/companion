import CopyEnvCommand from "@cli/env/copy";
import CreateEnvCommand from "@cli/env/create";
import DeleteEnvCommand from "@cli/env/delete";
import EditEnvCommand from "@cli/env/edit";
import GenerateEnvCommand from "@cli/env/generate";
import HealthEnvCommand from "@cli/env/health";
import { Command } from "@lib/index";

const EnvCommands: Command = {
  name: "env",
  description: "Manage environment variables",
  aliases: ["envs"],
  subcommands: [
    CopyEnvCommand,
    CreateEnvCommand,
    DeleteEnvCommand,
    EditEnvCommand,
    GenerateEnvCommand,
    HealthEnvCommand
  ]
};

export default EnvCommands;
