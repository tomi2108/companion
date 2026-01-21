import { getPath } from "@files";
import { Dir } from "@files/dir";
import { TextFile } from "@files/text_file";
import { Gitlab } from "@glab";
import { AppRepo, Dependency } from "@interface/dirs/app_repo";
import { Repo } from "@interface/dirs/repo";
import { AppType } from "@lib/constants";
import { ExecutionContext } from "@lib/ctx";
import { arrayDifference, kebabToCamel } from "@lib/utils";

import { WorkflowStep } from "../..";
import { amqDependencies, Connection, DaoConnections, dependenciesMap, IntConnections, s3Dependencies } from "./constants";

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
    const author = ctx.config.gitlab.username;

    const replaces = {
      "{{name}}": name,
      "{{appName}}": kebabToCamel(name.split("app-")?.[1] ?? ""),
      "{{description}}": description,
      "{{author}}": author,
      "{{url}}": origin
    };

    const files = app_repo.dir.traverse();
    for (const file of files) {
      for (const [pattern, replace] of Object.entries(replaces)) {
        file.replace(pattern, replace);
      }
    }
  }

  private async init_repo(dir: Dir, template: string, dependencies: Dependency[]) {
    dir.create();
    const new_repo = await Repo.cloneRepo(dir, template, true);
    new Dir(new_repo.dir.path).sub(".git").delete();
    await new_repo.init("master");
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

  private async initial_deploy(app_repo: AppRepo, branch: string) {
    await app_repo.switchBranchIfExists(branch);
    await app_repo.createNewBranch("initial_deploy");
    const readme = app_repo.dir.getFile("README.md");
    // TODO: test this
    readme.insertLine(readme.lineCount(), "");

    await app_repo.commit("feat: initial deploy");

    await app_repo.createAndMergeMr(branch);
    await app_repo.switchBranchIfExists(branch);
    await app_repo.deleteBranch("initial_deploy");
  }

  private async create_remote(app_repo: AppRepo, groupId: number, reads: Reads) {
    const { name, description } = reads;
    const glab = new Gitlab();
    const glab_repo = await glab.createAppProject({ name, groupId, description });
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
        const glab = new Gitlab();
        const { name, app_type } = reads;
        const frontend_path = getPath("frontend");
        const dir = frontend_path.sub(name);

        const mf_template_id = ctx.config.gitlab.mf_template_id;
        const frontend_id = ctx.config.gitlab.repos.frontend!;
        const mf_template_link = (await glab.getProject(mf_template_id)).http_url_to_repo;
        const dependencies = dependenciesMap[app_type] as Dependency[];
        const app_repo = await self.init_repo(dir, mf_template_link, dependencies);

        const origin = await self.create_remote(app_repo, frontend_id, reads);
        self.replaceFiles(ctx, reads, app_repo, origin);
        await self.initial_commit(app_repo);
        await app_repo.push("master");

        await app_repo.createNewBranch("release");
        await app_repo.push("release");

        await app_repo.createNewBranch("develop");
        await app_repo.push("develop");

        await self.initial_deploy(app_repo, "develop");
        return {};
      });
  }

  static backend() {
    return new AppNew(
      async (self, ctx, reads) => {
        const glab = new Gitlab();
        const { app_type, name } = reads;
        const isAmqReceiver = app_type === "wrk";
        const isAmqSender = await (async () => {
          if (isAmqReceiver || app_type !== "int") return false;
          return await ctx.ui.confirm({ message: "Is amq sender?", initial: false });
        })();
        const usesS3 = await (async () => {
          if (app_type !== "int" && app_type !== "wrk" && app_type !== "crn") return false;
          return await ctx.ui.confirm({ message: "Install s3?", initial: false });
        })();

        const backend_path = getPath("backend");
        const backend_id = ctx.config.gitlab.repos.backend!;
        let connection: Connection | null = null;

        if (app_type === "int") {
          connection = await ctx.ui.search({
            choices: Object.values(IntConnections),
            message: "Choose connection"
          });
        }

        if (app_type === "dao") {
          connection = await ctx.ui.search({
            choices: Object.values(DaoConnections),
            message: "Choose connection"
          });
        }

        const dir = backend_path.sub(name);
        const ms_template_id = ctx.config.gitlab.ms_template_id;
        const ms_template_link = (await glab.getProject(ms_template_id)).http_url_to_repo;

        const dependencies = (
          connection
            ? (dependenciesMap as Record<AppType, Record<Connection, Dependency[]>>)[app_type][connection]
            : dependenciesMap[app_type]
        ) as Dependency[];
        if (usesS3) dependencies.push(...s3Dependencies);
        if (isAmqSender || isAmqReceiver) dependencies.push(...amqDependencies);
        const app_repo = await self.init_repo(dir, ms_template_link, dependencies);

        const src = dir.sub("src");
        const tests = dir.sub("tests");

        const configuration = src.sub("configuration");
        const models = src.sub("models");
        const services = src.sub("services");
        const server = src.sub("server").getFile("index.ts");
        const app = src.getFile("app.ts");

        const tests_services = tests.sub("services");
        const tests_configuration = tests.sub("configuration");

        const apigw_setupTests = tests.getFile("apigw_setupTest.ts");
        const digit3_setupTests = tests.getFile("digit3_setupTest.ts");

        const s3_files = [configuration.getFile("s3.ts")];
        const amq_sender_files = [configuration.getFile("amq_sender.ts")];
        const amq_receiver_files = [configuration.getFile("amq_receiver.ts")];

        const wrk_files = [
          services.getFile("main.ts"),
          src.getFile("wrk_app.ts")
        ];
        const crn_files = [
          src.getFile("main.ts"),
          services.getFile("main.ts")
        ];
        const dao_files = [
          models.getFile("SequelizeExample.ts"),
          configuration.getFile("dao_db.ts"),
          configuration.getFile("dao_environment.ts"),
          tests_configuration.getFile("sequelize.test.ts")
        ];
        const bau_files = [
          models.getFile("MongooseExample.ts"),
          configuration.getFile("bau_db.ts"),
          configuration.getFile("bau_environment.ts")
        ];
        const db_files = [tests_configuration, ...bau_files, ...dao_files, models];
        const apigw_files = [
          configuration.getFile("apigw_environment.ts"),
          services.getFile("ApigwTokenService.ts"),
          tests_services.getFile("apigw.test.ts"),
          apigw_setupTests
        ];
        const digit3_files = [
          configuration.getFile("digit3_environment.ts"),
          services.getFile("Digit3TokenService.ts"),
          tests_services.getFile("digit3.test.ts"),
          digit3_setupTests
        ];
        const int_files = [...apigw_files, ...digit3_files, tests_services];
        const fcd_files = [configuration.getFile("fcd_environment.ts")];

        function getDeletedFilesFromConnections(c: Connection | null) {
          if (c === IntConnections.apigw) return digit3_files;
          if (c === IntConnections.digit3) return apigw_files;
          if (c === DaoConnections.mongo) return dao_files;
          if (c === DaoConnections.sql) return bau_files;
          return [];
        }

        function getMovedFilesFromConnections(c: Connection | null) {
          if (c === IntConnections.apigw) return [
            { from: services.getFile("ApigwTokenService.ts"), to: services.getFile("TokenService.ts") },
            { from: tests_services.getFile("apigw.test.ts"), to: tests_services.getFile("token.test.ts") },
            { from: apigw_setupTests, to: tests.getFile("setupTest.ts") }
          ];
          if (c === IntConnections.digit3) return [
            { from: services.getFile("Digit3TokenService.ts"), to: services.getFile("TokenService.ts") },
            { from: tests_services.getFile("digit3.test.ts"), to: tests_services.getFile("token.test.ts") },
            { from: digit3_setupTests, to: tests.getFile("setupTest.ts") }
          ];

          if (c === DaoConnections.mongo) return [
            // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/maro/-/issues/49]: add tests for bau connection to template
            // { from: path.join(tests_configuration, "mongoose.tests.ts"), to: path.join(configuration, "db.tests.ts") },
            { from: configuration.getFile("bau_db.ts"), to: configuration.getFile("db.ts") }
          ];
          if (c === DaoConnections.sql) return [
            { from: tests_configuration.getFile("sequelize.test.ts"), to: tests_configuration.getFile("db.tests.ts") },
            { from: configuration.getFile("dao_db.ts"), to: configuration.getFile("db.ts") }
          ];
          return [];
        }

        function getEnvFileByConnection(c: Connection | null) {
          if (c === IntConnections.apigw) return "apigw_environment.ts";
          if (c === IntConnections.digit3) return "digit3_environment.ts";
          if (c === DaoConnections.mongo) return "bau_environment.ts";
          if (c === DaoConnections.sql) return "dao_environment.ts";
          return null;
        }

        const amq_env = configuration.getFile("amq_environment.ts");
        const s3_env = configuration.getFile("s3_environment.ts");
        const envsByType: Record<AppType, string | null> = {
          app: null,
          dao: getEnvFileByConnection(connection),
          crn: "fcd_environment.ts",
          fcd: "fcd_environment.ts",
          wrk: "fcd_environment.ts",
          int: getEnvFileByConnection(connection)
        };
        const toRemove: Record<AppType, (TextFile | Dir)[]> = {
          app: [],
          wrk: [...int_files, ...db_files, ...arrayDifference(crn_files, wrk_files, (a, b) => a === b), app],
          crn: [...int_files, ...db_files, ...arrayDifference(wrk_files, crn_files, (a, b) => a === b)],
          dao: [...getDeletedFilesFromConnections(connection), ...int_files, ...fcd_files, ...crn_files, ...wrk_files],
          fcd: [...db_files, ...int_files, ...crn_files, ...wrk_files],
          int: [...db_files, ...crn_files, ...getDeletedFilesFromConnections(connection), ...fcd_files, ...wrk_files]
        };
        const toMove: Record<AppType, { from: TextFile; to: TextFile }[]> = {
          app: [],
          dao: getMovedFilesFromConnections(connection),
          fcd: [],
          wrk: [
            { from: src.getFile("wrk_app.ts"), to: src.getFile("app.ts") }
          ],
          crn: [],
          int: getMovedFilesFromConnections(connection)
        };

        const files_to_remove = toRemove[app_type];
        const files_to_move = toMove[app_type];

        if (isAmqSender) files_to_move.push({ from: configuration.getFile("amq_sender.ts"), to: configuration.getFile("amq.ts") });
        if (isAmqReceiver) files_to_move.push({ from: configuration.getFile("amq_receiver.ts"), to: configuration.getFile("amq.ts") });

        if (!isAmqSender) files_to_remove.push(...amq_sender_files);
        if (!isAmqReceiver) files_to_remove.push(...amq_receiver_files);
        if (!usesS3) files_to_remove.push(...s3_files, s3_env);
        if (!isAmqSender && !isAmqSender) files_to_remove.push(amq_env);

        const envs: TextFile[] = [];
        const envByType = envsByType[app_type];
        if (envByType) envs.push(configuration.getFile(envByType));

        if (isAmqSender || isAmqReceiver) envs.push(amq_env);
        if (usesS3) envs.push(s3_env);

        const merged = self.mergeEnvironmentFiles(envs);
        const env_file = configuration.getFile("environment.ts");
        env_file.write(merged);

        files_to_remove.push(...envs);

        files_to_remove.forEach((f) => f.delete());
        files_to_move.forEach((f) => {
          const content = f.from.read();
          f.to.write(content);
          f.from.delete();
        });

        const package_json = dir.getFile("package.json");

        if (app_type !== "int") dir.getFile("jest.config.js").removeLine(7);
        if (connection && connection === DaoConnections.mongo) server.insertLine(1, "import \"../configuration/db\";");
        if (app_type === "crn") {
          package_json.replace("app.js", "main.js");
          package_json.replace("app.ts", "main.ts");
        }

        const origin = await self.create_remote(app_repo, backend_id, reads);
        self.replaceFiles(ctx, reads, app_repo, origin);
        await self.initial_commit(app_repo);
        await self.initial_deploy(app_repo, "master");

        return {};
      });
  }

}
