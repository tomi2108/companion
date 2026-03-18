import { getPath } from "@files";
import { TextFile } from "@files/text_file";
import { AppRepo, Dependency } from "@interface/dirs/app_repo";
import { AppFactory } from "@interface/dirs/apps/app_factory";
import { MongoConnection } from "@interface/dirs/apps/connections/mongo";
import { ProjectLayout } from "@interface/dirs/apps/project/layout";
import { Dir } from "@interface/dirs/dir";
import { Repo } from "@interface/dirs/repo";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";
import { Config } from "@lib/config";
import { AppType } from "@lib/constants";
import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/decorators/ui";
import { kebabToCamel } from "@lib/utils";

import { WorkflowStep } from "../..";

type Reads = {
  app_type: AppType;
  description: string;
  name: string;
};

type RunFn = WorkflowStep<Reads>["run"];
export class AppNew extends WorkflowStep<Reads> {

  private constructor(
    private runFn: (self: AppNew, ...args: Parameters<RunFn>) => ReturnType<RunFn>
  ) {
    super();
  }

  override run(...args: Parameters<RunFn>) {
    return this.runFn(this, ...args);
  }

  private replaceFiles(ctx: ExecutionContext, reads: Reads, app_repo: AppRepo, origin: string) {
    const { name, description } = reads;
    const config = Config.getView();
    const author = config.get("gitlab.username");

    const replaces = {
      "{{name}}": name,
      "{{appName}}": kebabToCamel(name.split("app-")?.[1] ?? ""),
      "{{description}}": description,
      "{{author}}": author,
      "{{url}}": origin
    };

    const files = app_repo.dir.traverse();
    for (const file of files) {
      const spinner = ctx.ui.loading(`Replacing ${file}`);
      for (const [pattern, replace] of Object.entries(replaces)) {
        file.replace(pattern, replace);
      }
      spinner.succeed();
    }
  }

  @loading("Initializing repo")
  private async init_repo(dir: Dir, template: string, dependencies: Dependency[]) {
    dir.create();
    const new_repo = await Repo.cloneRepo(dir, template, true);
    new Dir(new_repo.dir.path).sub(".git").delete();
    await Repo.init(dir, "master");
    const app_repo = new AppRepo(new_repo.dir);
    await app_repo.install(dependencies);
    return app_repo;
  }

  private async initial_commit(app_repo: AppRepo) {
    await app_repo.build();
    await app_repo.test();
    await app_repo.addAll();
    await app_repo.commit("initial commit");
  }

  private async initial_deploy(ctx: ExecutionContext, app_repo: AppRepo, branch: string) {
    await app_repo.switchBranchIfExists(branch);
    await app_repo.createNewBranch("initial_deploy");
    const readme = app_repo.dir.getFile("README.md");
    readme.insertLine(readme.lineCount(), "");
    await app_repo.add(readme);

    await app_repo.commit("feat: initial deploy");

    await new RepoWithGitProvider(app_repo, ctx.gitProvider).createAndMergeMr(branch);
    await app_repo.switchBranchIfExists(branch);
    await app_repo.deleteBranch("initial_deploy");
  }

  @loading("Creating remote")
  private async create_remote(ctx: ExecutionContext, app_repo: AppRepo, groupId: string, reads: Reads) {
    const { name, description } = reads;
    const gitProvider = ctx.gitProvider.projects;
    const glab_repo = await gitProvider.createAppProject({ name, groupId, description });
    const origin = glab_repo.http_url_to_repo;
    await app_repo.addOrigin(origin);
    return origin;
  }

  private extractEnvContent(file: TextFile): string[] {
    const raw = file.read();
    const match = raw.match(/export const environment\s*=\s*{([\s\S]*?)};/);
    if (!match) throw new Error("Failed to extract environment from " + file);

    const content = match[1] ?? "";
    return (
      content
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => l !== ",")
        .map((l) => l.replace(/,*$/, ""))
    );
  }

  private mergeEnvironmentFiles(paths: TextFile[]) {
    const allProps: string[] = [];
    for (const path of paths) {
      const items = this.extractEnvContent(path);
      allProps.push(...items);
    }

    return (
      "export const environment = {\n"
      + allProps.map((l) => "  " + l + ",").join("\n")
      + "\n};\n"
    );
  }

  static frontend() {
    return new AppNew(
      async (self, ctx, reads) => {
        const projectProvider = ctx.gitProvider.projects;
        const { name } = reads;
        const frontend_path = getPath("frontend");
        const dir = frontend_path.sub(name);

        const config = Config.getView();
        const mf_template_id = config.get("gitlab.mf_template_id");
        const frontend_id = config.get("gitlab.repos.frontend");
        const mf_template_link = (await projectProvider.getProject(mf_template_id)).http_url_to_repo;
        const dependencies: Dependency[] = [];
        const app_repo = await self.init_repo(dir, mf_template_link, dependencies);

        const origin = await self.create_remote(ctx, app_repo, frontend_id, reads);
        self.replaceFiles(ctx, reads, app_repo, origin);
        await self.initial_commit(app_repo);
        await app_repo.push("master");

        await app_repo.createNewBranch("release");
        await app_repo.push("release");

        await app_repo.createNewBranch("develop");
        await app_repo.push("develop");

        await self.initial_deploy(ctx, app_repo, "develop");
        return {};
      });
  }

  static backend() {
    return new AppNew(
      async (self, ctx, reads) => {
        const projectProvider = ctx.gitProvider.projects;
        const { app_type, name } = reads;
        if (app_type === "app") throw new Error("Wrong app type");

        const app_factory = new AppFactory();
        let app = app_factory.getApp(app_type);

        const connections = app.connections;
        if (connections && connections.length > 0 && app.withConnection) {
          const choice = await ctx.ui.search({
            choices: connections.map((c) => c.toString()),
            message: "Choose connection"
          });
          const connection = connections.find((c) => c.toString() === choice)!;
          app = app.withConnection(connection);
        }

        const features = app.features;
        if (features && features.length > 0) {
          const choices = await ctx.ui.search({
            choices: features.map((c) => c.toString()),
            multiple: true,
            message: "Choose capabilities"
          });
          const capabilites = features.filter((f) => choices.includes(f.toString()));
          app = app_factory.withCapabilities(app, capabilites);
        }

        const config = Config.getView();
        const backend_path = getPath("backend");
        const backend_id = config.get("gitlab.repos.backend");
        const dir = backend_path.sub(name);
        const layout = new ProjectLayout(dir);
        const ms_template_id = config.get("gitlab.ms_template_id");
        const ms_template_link = (await projectProvider.getProject(ms_template_id)).http_url_to_repo;

        const dependencies = app.dependencies();
        const app_repo = await self.init_repo(dir, ms_template_link, dependencies);

        const envs = app.envFiles(layout);
        const merged = self.mergeEnvironmentFiles(envs);
        const env_file = layout.configuration.createFile("environment.ts");
        env_file.write(merged);
        app.deletions(layout).forEach((f) => f.delete());
        app.moves(layout).forEach((f) => {
          const content = f.from.read();
          f.to.write(content);
          f.from.delete();
        });

        const package_json = dir.getFile("package.json");

        const server = layout.server;
        if (app_type !== "int") dir.getFile("jest.config.js").removeLine(7);
        if (app.connection instanceof MongoConnection) server.insertLine(1, "import \"../configuration/db\";");
        if (app_type === "crn") {
          package_json.replace("app.js", "main.js");
          package_json.replace("app.ts", "main.ts");
        }

        const origin = await self.create_remote(ctx, app_repo, backend_id, reads);
        self.replaceFiles(ctx, reads, app_repo, origin);
        await self.initial_commit(app_repo);
        await self.initial_deploy(ctx, app_repo, "master");

        return {};
      });
  }

}
