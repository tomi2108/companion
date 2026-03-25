import chalk from "chalk";
import path from "node:path";

import ConfigCommands from "@cli/config";
import MrCommands from "@cli/mr";
import { PluginCommands } from "@cli/plugin";
import ReposCommands from "@cli/repos";
import UpgradeCommand from "@cli/upgrade";
import { AppRepo } from "@interface/dirs/app_repo";
import { Dir } from "@interface/dirs/dir";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";
import { GitProvider } from "@interface/git/provider";
import { Config } from "@lib/config";
import { GitlabConfig } from "@lib/config/glab";
import { ConfigLoader } from "@lib/config/loader";
import { PathsConfig } from "@lib/config/paths";
import { PluginsConfig } from "@lib/config/plugins";
import { PreferencesConfig, root } from "@lib/config/preferences";
import { PresetLoader } from "@lib/config/preset";
import { ConfigRegistry } from "@lib/config/registry";
import { ConfigView } from "@lib/config/view";
import { ExecutionContext } from "@lib/ctx";
import { GitProviderFactory } from "@lib/ctx/git_provider";
import { ConsoleLogger } from "@lib/log/console";
import { DebugLogger } from "@lib/log/debug";
import { FileLogger } from "@lib/log/file";
import { PluginRegistry } from "@lib/plugins/registry";
import { RuntimeConfig } from "@lib/runtime";
import { DefaultUI } from "@lib/ui/default";

export async function initConfig({ config }: { config?: string }) {
  const configs = [
    new PreferencesConfig(),
    new PathsConfig(),
    new PluginsConfig(),
    new GitlabConfig()
  ];
  for (const section of configs) ConfigRegistry.register(section);
  await Config.check(config);
}

function createLogger(runtime: RuntimeConfig) {
  if (runtime.logFile) return new FileLogger(runtime.logFile);
  if (runtime.debug) return new DebugLogger();
  return new ConsoleLogger();
}

async function addConfigs(registry: PluginRegistry) {
  const configsDir = registry.plugins
    .map((p) => p.configs_dir)
    .filter((c): c is Dir => Boolean(c));

  configsDir.forEach((d) => PresetLoader.addConfigDir(d));
}

export async function registerCore(registry: PluginRegistry) {
  registry.registerPlugin([], {
    version: "1.0.0",
    dependencies: [],
    commands: [
      PluginCommands,
      ConfigCommands,
      UpgradeCommand,

      MrCommands,
      ReposCommands
    ],
    dir: new Dir(root),
    name: "core",
    toChoice() {
      return { name: "core" };
    }
  });
}

export async function readPlugins(registry: PluginRegistry, { config }: { config?: string }) {
  const view = new ConfigView(ConfigLoader.load(config), undefined, { validate: false });
  const path = view.get("plugins.dir");
  const disabled = view.get("plugins.disabled");
  if (!path) return;
  const plugins = await registry.readDir(new Dir(path));
  registry.registerPlugin(disabled, ...plugins);
  await addConfigs(registry);

  registry.plugins.forEach((p) => p.onLoad?.());
  registry.init();
}

export async function initCtx({
  prod,
  debug,
  log
}: {
  config?: string;
  prod?: boolean;
  debug?: boolean;
  log?: string;
}) {
  const runtime: RuntimeConfig = {
    debug: Boolean(debug),
    prod: Boolean(prod),
    logFile: log
  };

  ExecutionContext.bootstrap({
    logger: createLogger(runtime),
    ui: new DefaultUI()
  });

  ConfigRegistry.applyRuntime(runtime);
}

function compareVersions(
  repo: AppRepo,
  provider: GitProvider,
  command: string,
  name: string
) {
  const remote_repo = new RepoWithGitProvider(repo, provider);
  const current_version = `v${repo.getPackage().version}`;
  remote_repo.getLatestRelease().then((remote_version) => {
    if (current_version !== remote_version) {
      console.log(`New version for ${name} `, chalk.green(remote_version), "is available!, You are using", chalk.red(current_version));
      console.log(`Upgrade now with: ${command} `);
    }
    return;
  }).catch(() => { });
}

export async function checkVersion() {
  const config = Config.getView();
  const provider = GitProviderFactory.get("gitlab", config);
  const root = path.resolve(__dirname, "../../");
  const repo = new AppRepo(new Dir(root));
  compareVersions(repo, provider, "maro upgrade", "maro");
}
