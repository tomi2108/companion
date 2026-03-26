import chalk from "chalk";
import { satisfies } from "semver";

import { JsonFile } from "@files/json_file";
import { AppRepo } from "@interface/dirs/app_repo";
import { Dir } from "@interface/dirs/dir";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

import { MaroPackageConfig, Plugin } from "./plugin";
import { PluginRegistry } from "./registry";

export class PluginInstaller {
  constructor(
    private pluginsDir: Dir,
    private disabled: string[]
  ) { }

  private async loadPlugin(dir: Dir): Promise<Plugin> {
    const file = new JsonFile<MaroPackageConfig>(dir.getFile("package.json").path);
    return new Plugin(file);
  }

  private async findInstalled(name: string): Promise<Plugin | undefined> {
    const registry = new PluginRegistry();
    const plugins = await registry.getInstalled(this.pluginsDir);
    return plugins.find((p) => p.name === name);
  }

  async installFromGit(url: string) {
    const repo = await Repo.cloneRepo(this.pluginsDir, url);
    const appRepo = new AppRepo(repo.dir);
    const plugin = await this.loadPlugin(repo.dir);
    await this.installDependencies(plugin, new Set());

    await appRepo.install([], { ignorePeer: true });
    await appRepo.build();
  }

  private async installDependencies(
    plugin: Plugin,
    visiting: Set<string>
  ) {
    const ctx = ExecutionContext.get();
    if (visiting.has(plugin.name)) throw new Error(
      `Circular dependency detected: ${[...Array.from(visiting), plugin.name].join(" -> ")}`
    );

    visiting.add(plugin.name);

    for (const dep of plugin.dependencies) {
      const installed = await this.findInstalled(dep.name);

      if (!installed) {
        const spinner = ctx.ui.loading(`Installing dependency ${dep.name}`);
        const repo = await Repo.cloneRepo(this.pluginsDir, dep.source);
        const depPlugin = await this.loadPlugin(repo.dir);

        if (!satisfies(depPlugin.version, dep.version)) {
          spinner.fail();
          console.log(chalk.red(
            `Dependency ${dep.name}@${dep.version} `
            + `does not satisfy installed version ${depPlugin.version}`
          ));
        }

        await this.installDependencies(depPlugin, visiting);

        const appRepo = new AppRepo(repo.dir);
        await appRepo.install([], { ignorePeer: true });
        await appRepo.build();
        spinner.succeed();
      } else if (this.disabled.includes(dep.name)) console.log(chalk.red(
        `Plugin ${plugin.name} requires ${dep.name}, `
        + "but it is disabled"
      ));
      else if (!satisfies(installed.version, dep.version)) console.log(chalk.red(
        `Plugin ${plugin.name} requires ${dep.name}@${dep.version}, `
        + `but installed version is ${installed.version}`
      ));
    }

    visiting.delete(plugin.name);
  }
}

