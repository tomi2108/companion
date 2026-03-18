import path from "node:path";
import yargs, { Argv } from "yargs";

import { JsonFile } from "@files/json_file";
import { Dir } from "@interface/dirs/dir";
import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";

import { Command } from "./command";
import { MaroPackageConfig, Plugin } from "./plugin";

type RegisteredCommand = {
  command: Command;
  plugin: string;
};

export type PluginExport = {
  name: string;
  commands?: Command[];
  onLoad?: () => void;
};

export class PluginRegistry {
  plugins: Plugin[] = [];
  private commandMap = new Map<string, RegisteredCommand>();

  async readFile(file: JsonFile<MaroPackageConfig>): Promise<Plugin | undefined> {
    const content = file.read();
    const dir = file.dir();
    const maro = content.maro;
    if (!maro) return;
    const { plugin: plugin_path } = maro;
    const plugin_file = plugin_path ? path.resolve(dir, plugin_path) : undefined;
    const new_plugin = plugin_file ? await import(plugin_file) : undefined;
    const np = new_plugin?.default.default as PluginExport | undefined;
    const commands = np?.commands;
    const onLoad = np?.onLoad;
    return new Plugin(file, commands, onLoad);
  }

  async getInstalled(dir: Dir) {
    const files = dir.traverse();
    const plugins = files
      .filter((f) => f.name() === "package.json")
      .map((f) => new JsonFile<MaroPackageConfig>(f.path))
      .map((f) => new Plugin(f));
    return plugins;
  }

  async readDir(dir: Dir) {
    const files = dir.traverse();
    const plugins = await Promise.all(
      files
        .filter((f) => f.name() === "package.json")
        .map((f) => new JsonFile<MaroPackageConfig>(f.path))
        .map(this.readFile)
    );

    return plugins.filter((f): f is Plugin => Boolean(f));
  }

  registerPlugin(disabled: string[], ...plugins: Plugin[]) {
    const to_register = plugins.filter((p) => !disabled.includes(p.name));
    this.plugins.push(...to_register);
  }

  private mergeCommand(
    existing: RegisteredCommand,
    incoming: RegisteredCommand
  ): RegisteredCommand {

    const existingCmd = existing.command;
    const incomingCmd = incoming.command;

    if ("run" in existingCmd || "run" in incomingCmd) {
      throw new Error(
        `Command collision: "${existingCmd.name}" declared as executable in `
        + `"${existing.plugin}" and "${incoming.plugin}". `
        + "Executable commands cannot be merged."
      );
    }

    const subMap = new Map<string, RegisteredCommand>();

    for (const sub of existingCmd.subcommands) {
      subMap.set(sub.name, { command: sub, plugin: existing.plugin });
    }

    for (const sub of incomingCmd.subcommands) {
      const current = subMap.get(sub.name);
      if (current) subMap.set(sub.name, this.mergeCommand(current, { command: sub, plugin: incoming.plugin }));
      else subMap.set(sub.name, { command: sub, plugin: incoming.plugin });
    }

    return {
      plugin: existing.plugin,
      command: {
        name: existingCmd.name,
        description: existingCmd.description ?? incomingCmd.description,
        aliases: existingCmd.aliases ?? incomingCmd.aliases,
        subcommands: Array.from(subMap.values()).map((r) => r.command)
      }
    };
  }

  private declareCommand(command: Command, yargs: Argv) {
    const hasSubCommands = "subcommands" in command && command.subcommands;
    yargs.command({
      command: hasSubCommands ? `${command.name} <command>` : command.name,
      describe: command.description,
      aliases: command.aliases,
      builder: (yargs: Argv) => {
        for (const option of command.options ?? []) {
          yargs.option(option.name, {
            alias: option.aliases,
            describe: option.description,
            conflicts: option.conflicts,
            type: option.type
          });
        }

        if (hasSubCommands) {
          for (const subcommand of command.subcommands ?? []) {
            this.declareCommand(subcommand, yargs);
          }
          yargs
            .demandCommand(1, "Please specify a command")
            .help();
        }
        return yargs;
      },
      handler: (args) => {
        const ctx = ExecutionContext.get();
        const config = Config.getView();
        command.run?.({ ctx, config, args });
      }
    }).help();
  }

  init() {
    for (const plugin of this.plugins) {
      for (const command of plugin.commands) {
        if (this.commandMap.has(command.name)) {
          const merged = this.mergeCommand(this.commandMap.get(command.name)!, { command, plugin: plugin.name });
          this.commandMap.set(command.name, merged);
        } else this.commandMap.set(command.name, { command, plugin: plugin.name });
      }
    }

    for (const command of Array.from(this.commandMap.values())) {
      this.declareCommand(command.command, yargs);
    }
  }
}
