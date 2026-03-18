import chalk from "chalk";
import path from "node:path";

import AppCommands from "@cli/app";
import ConfigCommands from "@cli/config";
import CronCommands from "@cli/cron";
import EnvCommands from "@cli/env";
import MrCommands from "@cli/mr";
import { PluginCommands } from "@cli/plugin";
import PodCommands from "@cli/pod";
import ProjectCommands from "@cli/project";
import ReposCommands from "@cli/repos";
import RouteCommands from "@cli/route";
import UpgradeCommand from "@cli/upgrade";
import { AppRepo } from "@interface/dirs/app_repo";
import { Dir } from "@interface/dirs/dir";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";
import { GitProvider } from "@interface/git/provider";
import { LintDeploymentFilesAction } from "@lib/actions/lint_deployment_files";
import { Config } from "@lib/config";
import { AppConfig } from "@lib/config/app";
import { DynatraceConfig } from "@lib/config/dynatrace";
import { EnvsConfig } from "@lib/config/envs";
import { GitlabConfig } from "@lib/config/glab";
import { ConfigLoader } from "@lib/config/loader";
import { OpenShiftConfig } from "@lib/config/oc";
import { PathsConfig } from "@lib/config/paths";
import { PluginsConfig } from "@lib/config/plugins";
import { PreferencesConfig, root } from "@lib/config/preferences";
import { PresetLoader } from "@lib/config/preset";
import { ProjectConfig } from "@lib/config/project";
import { ConfigRegistry } from "@lib/config/registry";
import { ReposConfig } from "@lib/config/repos";
import { SonarConfig } from "@lib/config/sonar";
import { SqlConfig } from "@lib/config/sql";
import { ThreescaleConfig } from "@lib/config/threescale";
import { VaultConfig } from "@lib/config/vault";
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
    new OpenShiftConfig(),
    new GitlabConfig(),
    new VaultConfig(),
    new SonarConfig(),
    new PreferencesConfig(),
    new ThreescaleConfig(),
    new PathsConfig(),
    new DynatraceConfig(),
    new ReposConfig(),
    new EnvsConfig(),
    new AppConfig(),
    new ProjectConfig(),
    new SqlConfig(),
    new PluginsConfig()
  ];
  for (const section of configs) ConfigRegistry.register(section);
  await Config.check(config);
}

function createLogger(runtime: RuntimeConfig) {
  if (runtime.logFile) return new FileLogger(runtime.logFile);
  if (runtime.debug) return new DebugLogger();
  return new ConsoleLogger();
}

export async function registerActions() {
  new LintDeploymentFilesAction().register();
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

      ProjectCommands,
      EnvCommands,
      PodCommands,
      CronCommands,
      RouteCommands,

      MrCommands,
      ReposCommands,

      AppCommands
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
