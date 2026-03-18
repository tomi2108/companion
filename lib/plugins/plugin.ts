import path from "node:path";

import { JsonFile } from "@files/json_file";
import { Dir } from "@interface/dirs/dir";
import { Choice } from "@lib/constants";

import { Command } from "./command";

export type MaroPackageConfig = {
  name: string;
  version: string;
  maro: {
    plugin: string;
    configs?: string;
    requires?: { [k: string]: PluginDependecy };
  };
};

export type PluginDependecy = { version: string; source: string };

export class Plugin {
  name: string;
  configs_dir?: Dir;
  version: string;
  dir: Dir;
  dependencies: ({ name: string } & PluginDependecy)[];
  onLoad?: () => void;

  constructor(
    file: JsonFile<MaroPackageConfig>,
    public commands: Command[] = [],
    onLoad = () => { }
  ) {
    const content = file.read();
    const dir = file.dir();
    const maro = content.maro;
    const name = content.name;
    const { configs, requires } = maro;
    const configs_dir = configs ? new Dir(path.resolve(dir, configs)) : undefined;

    this.dependencies = requires ? Object.entries(requires).map(([name, dependency]) => ({ name, ...dependency })) : [];
    this.version = content.version;

    this.onLoad = onLoad;
    this.dir = new Dir(dir);
    this.configs_dir = configs_dir;
    this.name = name;
  }

  toChoice(): Choice {
    return { name: this.name };
  }
}
