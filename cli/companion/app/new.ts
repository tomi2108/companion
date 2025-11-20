import fs from "node:fs";
import path from "node:path";

import { getApp } from "@files";
import { AppRepo, Dependency } from "@files/app_repo";
import { Repo } from "@files/repo";
import { createDirIfNotExists, insertLine, removeLine, replace } from "@files/utils";
import { Gitlab } from "@glab";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import { APP_TYPES, AppType } from "@lib/constants";
import log from "@lib/log";
import { confirm, input, loading, search } from "@lib/ui";
import { arrayDifference, kebabToCamel } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { PipelineStatus } from "@oc/pipelinerun";
import { findArgoPipeline, findCIPipeline, findSyncPipeline, waitForPipeline } from "@oc/utils";

const Connections = {
  apigw: "apigw",
  digit3: "digit3"
} as const;
type Connection = typeof Connections[keyof typeof Connections];

const s3Dependencies: Dependency[] = [{ name: "@aws-sdk/client-s3" }, { name: "@aws-sdk/node-http-handler" }];
const amqDependencies: Dependency[] = [{ name: "rhea-promise" }];

const dependenciesMap: Record<AppType, Dependency[]> = {
  app: [],
  wrk: [...amqDependencies],
  bau: [{ name: "mongoose" }],
  dao: [{ name: "sequelize" }],
  crn: [],
  fcd: [{
    name: "axios",
    version: "0.21.4"
  }],
  int: [{
    name: "axios",
    version: "0.21.4"
  }]
};

export default {
  command: "new",
  aliases: ["n"],
  describe: "Create a new app from template",
  handler: async () => {
    const glab = new Gitlab();
    const config = Config.get();
    const type = await search({ choices: [...APP_TYPES], message: "Choose app type" }) as AppType;
    const initial_version = type === "app" ? "v1.0.0-beta.1" : "v1.0.0";
    let connection: Connection | null = null;

    const argocd_path = config.paths.argocd;
    const deploy_id = config.gitlab.repos.despliegues;
    const deploy_path = config.paths.despliegues;
    if (!deploy_id) throw new ConfigError("gitlab.repos.despliegues");
    if (!deploy_path) throw new ConfigError("paths.despliegues");
    if (!argocd_path) throw new ConfigError("paths.argocd");

    const dependencies = dependenciesMap[type];
    const name = await input({ message: "Enter name" });
    const description = await input({ message: "Enter description" });
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const projects_to_deploy = await promptForOcResource(projects, { message: "Select projects to deploy", multiple: true });

    const replaceName = (file: string) => replace("{{name}}", name, file);
    const replaceAppName = (file: string) => replace("{{appName}}", kebabToCamel(name.split("app-")?.[1] ?? ""), file);
    const replaceDescription = (file: string) => replace("{{description}}", description, file);
    const replaceAuthor = (file: string) => replace("{{author}}", config.gitlab.username, file);

    let app_repo: AppRepo;

    if (type === "app") {
      const frontend_path = config.paths.frontend;
      const frontend_id = config.gitlab.repos.frontend;
      if (!frontend_path) throw new ConfigError("paths.frontend");
      if (!frontend_id) throw new ConfigError("gitlab.repos.frontend");
      if (!frontend_id || !frontend_path) process.exit(1);

      const full_path = path.join(frontend_path, name);

      const mf_template_id = config.gitlab.mf_template_id;
      const mf_template_link = (await glab.getProject(mf_template_id)).http_url_to_repo;

      app_repo = await init_repo(full_path, mf_template_link, dependencies);
      replaceAppName(path.join(full_path, "mf-config.js"));

      replaceName(path.join(path.join(full_path, "sonar-project.properties")));

      replaceName(path.join(full_path, "README.md"));
      replaceDescription(path.join(full_path, "README.md"));

      replaceAuthor(path.join(full_path, "package.json"));
      replaceDescription(path.join(full_path, "package.json"));

      await initial_commit(app_repo);
      // await create_remote(app_repo, frontend_id, { name, description });

      // await app_repo.push("master");
      // await app_repo.createNewBranch("release");
      // await app_repo.push("release");
      // await app_repo.createNewBranch("develop");
      // await app_repo.push("develop");

      // await app_repo.switchBranchIfExists("master");
      // replaceName(path.join(full_path, "package.json"));
      // await app_repo.add("package.json");
      // await app_repo.commit("replace name");
      // await app_repo.push("master");
      //
      // await app_repo.switchBranchIfExists("release");
      // replaceName(path.join(full_path, "package.json"));
      // await app_repo.add("package.json");
      // await app_repo.commit("replace name");
      // await app_repo.push("release");
      //
      // await app_repo.switchBranchIfExists("develop");
      // await app_repo.createNewBranch("initial_deploy");
      // replaceName(path.join(full_path, "package.json"));
      //
      // await app_repo.commit("feat: initial deploy");
      //
      // await app_repo.createAndMergeMr("develop");
      // await app_repo.switchBranchIfExists("develop");
      // await app_repo.deleteBranch("initial_deploy");
    } else {
      const isAmqReceiver = type === "wrk";
      const isAmqSender = await (async () => {
        if (isAmqReceiver || type !== "int") return false;
        return await confirm({ message: "Is amq sender?", initial: false });
      })();
      const usesS3 = await (async () => {
        if (type !== "int" && type !== "wrk" && type !== "crn") return false;
        return await confirm({ message: "Install s3?", initial: false });
      })();
      const backend_path = config.paths.backend;
      const backend_id = config.gitlab.repos.backend;
      if (!backend_path) throw new ConfigError("paths.backend");
      if (!backend_id) throw new ConfigError("gitlab.repos.backend");
      if (!backend_id || !backend_path) process.exit(1);

      if (type === "int") {
        connection = await search({ choices: Object.values(Connections), message: "Choose connection" }) as Connection;
      }

      const full_path = path.join(backend_path, name);

      const ms_template_id = config.gitlab.ms_template_id;
      const ms_template_link = (await glab.getProject(ms_template_id)).http_url_to_repo;

      if (usesS3) dependencies.push(...s3Dependencies);
      if (isAmqSender || isAmqReceiver) dependencies.push(...amqDependencies);
      app_repo = await init_repo(full_path, ms_template_link, dependencies);

      const src = path.join(full_path, "src");
      const swagger = path.join(full_path, "swagger");
      const tests = path.join(full_path, "tests");

      const configuration = path.join(src, "configuration");
      const models = path.join(src, "models");
      const services = path.join(src, "services");
      const server = path.join(src, "server", "index.ts");
      const app = path.join(src, "app.ts");

      const tests_services = path.join(tests, "services");
      const tests_configuration = path.join(tests, "configuration");

      const apigw_setupTests = path.join(tests, "apigw_setupTest.ts");
      const digit3_setupTests = path.join(tests, "digit3_setupTest.ts");

      const s3_files = [path.join(configuration, "s3.ts")];
      const amq_sender_files = [path.join(configuration, "amq_sender.ts")];
      const amq_receiver_files = [path.join(configuration, "amq_receiver.ts")];

      const wrk_files = [
        path.join(services, "main.ts"),
        path.join(src, "wrk_app.ts")
      ];
      const crn_files = [
        path.join(src, "main.ts"),
        path.join(services, "main.ts")
      ];
      const dao_files = [
        path.join(models, "SequelizeExample.ts"),
        path.join(configuration, "dao_db.ts"),
        path.join(configuration, "dao_environment.ts"),
        path.join(tests_configuration, "sequelize.test.ts")
      ];
      const bau_files = [
        path.join(models, "MongooseExample.ts"),
        path.join(configuration, "bau_db.ts"),
        path.join(configuration, "bau_environment.ts")
      ];
      const db_files = [tests_configuration, ...bau_files, ...dao_files, models];
      const apigw_files = [
        path.join(configuration, "apigw_environment.ts"),
        path.join(services, "ApigwTokenService.ts"),
        path.join(tests_services, "apigw.test.ts"),
        apigw_setupTests
      ];
      const digit3_files = [
        path.join(configuration, "digit3_environment.ts"),
        path.join(services, "Digit3TokenService.ts"),
        path.join(tests_services, "digit3.test.ts"),
        digit3_setupTests
      ];
      const int_files = [...apigw_files, ...digit3_files, tests_services];
      const fcd_files = [path.join(configuration, "fcd_environment.ts")];

      function getDeletedFilesFromConnections(c: Connection | null) {
        if (c === Connections.apigw) return digit3_files;
        if (c === Connections.digit3) return apigw_files;
        return [];
      }

      function getMovedFilesFromConnections(c: Connection | null) {
        if (c === Connections.apigw) return [
          { from: path.join(services, "ApigwTokenService.ts"), to: path.join(services, "TokenService.ts") },
          { from: path.join(tests_services, "apigw.test.ts"), to: path.join(tests_services, "token.test.ts") },
          { from: apigw_setupTests, to: path.join(tests, "setupTest.ts") }
        ];
        if (c === Connections.digit3) return [
          { from: path.join(services, "Digit3TokenService.ts"), to: path.join(services, "TokenService.ts") },
          { from: path.join(tests_services, "digit3.test.ts"), to: path.join(tests_services, "token.test.ts") },
          { from: digit3_setupTests, to: path.join(tests, "setupTest.ts") }
        ];
        return [];
      }

      function getEnvFileByConnection(c: Connection | null) {
        if (c === Connections.apigw) return "apigw_environment.ts";
        if (c === Connections.digit3) return "digit3_environment.ts";
        return null;
      }

      const amq_env = "amq_environment.ts";
      const s3_env = "s3_environment.ts";
      const envsByType: Record<AppType, string | null> = {
        app: null,
        bau: "bau_environment.ts",
        dao: "dao_environment.ts",
        crn: "fcd_environment.ts",
        fcd: "fcd_environment.ts",
        wrk: "fcd_environment.ts",
        int: getEnvFileByConnection(connection)
      };
      const toRemove: Record<AppType, string[]> = {
        app: [],
        wrk: [...int_files, ...db_files, ...arrayDifference(crn_files, wrk_files, (a, b) => a === b), app],
        crn: [...int_files, ...db_files, ...arrayDifference(wrk_files, crn_files, (a, b) => a === b)],
        bau: [...dao_files, ...int_files, ...fcd_files, ...crn_files, ...wrk_files],
        dao: [...bau_files, ...int_files, ...fcd_files, ...crn_files, ...wrk_files],
        fcd: [...db_files, ...int_files, ...crn_files, ...wrk_files],
        int: [...db_files, ...crn_files, ...getDeletedFilesFromConnections(connection), ...fcd_files, ...wrk_files]
      };
      const toMove: Record<AppType, { from: string; to: string }[]> = {
        app: [],
        bau: [
          // TODO: add tests for bau connection to template
          // { from: path.join(tests_configuration, "mongoose.tests.ts"), to: path.join(configuration, "db.tests.ts") },
          { from: path.join(configuration, "bau_db.ts"), to: path.join(configuration, "db.ts") }
        ],
        dao: [
          { from: path.join(tests_configuration, "sequelize.test.ts"), to: path.join(tests_configuration, "db.tests.ts") },
          { from: path.join(configuration, "dao_db.ts"), to: path.join(configuration, "db.ts") }
        ],
        fcd: [],
        wrk: [
          { from: path.join(src, "wrk_app.ts"), to: path.join(src, "app.ts") }
        ],
        crn: [],
        int: [...getMovedFilesFromConnections(connection)]
      };

      const files_to_remove = toRemove[type];
      const files_to_move = toMove[type];

      if (isAmqSender) files_to_move.push({ from: path.join(configuration, "amq_sender.ts"), to: path.join(configuration, "amq.ts") });
      if (isAmqReceiver) files_to_move.push({ from: path.join(configuration, "amq_receiver.ts"), to: path.join(configuration, "amq.ts") });

      if (!isAmqSender) files_to_remove.push(...amq_sender_files);
      if (!isAmqReceiver) files_to_remove.push(...amq_receiver_files);
      if (!usesS3) files_to_remove.push(
        ...s3_files,
        path.join(configuration, s3_env)
      );
      if (!isAmqSender && !isAmqSender) files_to_remove.push(path.join(configuration, amq_env));

      const envs = [];
      const envByType = envsByType[type];
      if (envByType) envs.push(envByType);

      if (isAmqSender || isAmqReceiver) envs.push(amq_env);
      if (usesS3) envs.push(s3_env);

      const envs_full_path = envs.map((f) => path.join(configuration, f));
      const merged = mergeEnvironmentFiles(envs_full_path);
      writeEnvFile(path.join(configuration, "environment.ts"), merged);

      files_to_remove.push(...envs_full_path);

      files_to_remove.forEach((f) => fs.rmSync(f, { recursive: true, force: true }));
      files_to_move.forEach((f) => {
        fs.cpSync(f.from, f.to);
        fs.rmSync(f.from);
      });

      const package_json = path.join(full_path, "package.json");
      replaceAuthor(package_json);
      replaceName(package_json);
      replaceDescription(package_json);

      replaceName(path.join(full_path, "README.md"));
      replaceDescription(path.join(full_path, "README.md"));

      replaceName(path.join(path.join(full_path, "sonar-project.properties")));

      replaceName(app);
      replaceName(server);
      replaceName(path.join(src, "utils", "constant.ts"));

      replaceName(path.join(tests, "index.test.ts"));

      replaceName(path.join(swagger, "index.ts"));
      replaceDescription(path.join(swagger, "index.ts"));

      replaceName(path.join(swagger, "docs", "specification.yaml"));
      replaceDescription(path.join(swagger, "docs", "specification.yaml"));

      if (type !== "int") removeLine(7, path.join(full_path, "jest.config.js"));
      if (type === "bau") insertLine(1, server, "import \"../configuration/db\";");
      if (type === "crn") {
        replace("app.js", "main.js", package_json);
        replace("app.ts", "main.ts", package_json);
      }

      await initial_commit(app_repo);
      const origin = await create_remote(app_repo, backend_id, { name, description });
      await app_repo.push("master");

      const replaceUrl = (file: string) => replace("{{url}}", origin, file);
      await app_repo.createNewBranch("initial_deploy");
      replaceUrl(path.join(full_path, "package.json"));
      replaceUrl(path.join(full_path, "README.md"));
      await app_repo.add("README.md");
      await app_repo.add("package.json");
      await app_repo.commit("feat: initial deploy");
      await app_repo.createAndMergeMr("master");
      await app_repo.switchBranchIfExists("master");
      await app_repo.deleteBranch("initial_deploy");
    }

    const ci_pipeline = await findCIPipeline(app_repo);
    if (!ci_pipeline) return log.error("Could not find ci pipeline");
    const ci_status = await waitForPipeline(ci_pipeline);
    if (ci_status === PipelineStatus.failed) return log.error("CI pipeline failed");

    for (const project of projects_to_deploy) {
      await new Gitlab().createArgoIssue(name, initial_version, project);
      const argo_pipeline = await findArgoPipeline(app_repo, project);
      if (!argo_pipeline) return log.error("Could not find argo pipeline");
      const status = await waitForPipeline(argo_pipeline);
      if (status === PipelineStatus.failed) log.error(`Argo pipeline failed for project ${project.name}`);
    }

    // TODO: clone only deploy repo created
    await glab.cloneGroupOrProject(deploy_id, deploy_path);
    const { deploy_repo } = await getApp(name);
    if (!deploy_repo) return log.error("Could not find deploy repo");

    await deploy_repo.deploy(projects_to_deploy.map((p) => ({ name: p.name, configmaps: [], secrets: [] })), initial_version);
    const sync_pipeline = await findSyncPipeline(app_repo);
    if (!sync_pipeline) return log.error("Could not find sync pipeline");
    const cd_status = await waitForPipeline(sync_pipeline);
    if (cd_status === PipelineStatus.failed) return log.error("CI pipeline failed");

    if (type === "fcd") {
      // TODO : expose in 3scale
    }

    log.success(`New app ${name} created successfully`);
  }
};

async function init_repo(full_path: string, template: string, dependencies: Dependency[]) {
  const clone_spinner = loading("Cloning template");
  createDirIfNotExists(full_path);
  const new_repo = await Repo.cloneRepo(full_path, template, true);
  clone_spinner.succeed();

  const init_spinner = loading("Initializing repository");
  fs.rmSync(path.join(new_repo.full_path, ".git"), { recursive: true });
  await new_repo.init("master");
  init_spinner.succeed();

  const install_spinner = loading("Installing dependencies");
  const app_repo = new AppRepo(new_repo.full_path);
  await app_repo.install(dependencies);
  install_spinner.succeed();
  return app_repo;
}

async function initial_commit(app_repo: AppRepo) {
  await app_repo.build();
  await app_repo.test();
  await app_repo.add(".");
  await app_repo.commit("initial commit");
}

async function create_remote(app_repo: AppRepo, groupId: number, { name, description }: {
  name: string;
  description: string;
}) {
  const glab = new Gitlab();
  const creating_spinner = loading("Creating GitLab repository");
  const glab_repo = await glab.createAppProject({ name, groupId, description });
  const origin = glab_repo.http_url_to_repo;
  await app_repo.addOrigin(origin);
  creating_spinner.succeed();
  return origin;
}

function extractEnvContent(path: string): string[] {
  const raw = fs.readFileSync(path, "utf8");

  const match = raw.match(/export const environment\s*=\s*{([\s\S]*?)};/);
  if (!match) throw new Error("Failed to extract environment from " + path);

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

function mergeEnvironmentFiles(paths: string[]) {
  const allProps: string[] = [];
  for (const path of paths) {
    const items = extractEnvContent(path);
    allProps.push(...items);
  }

  return (
    "export const environment = {\n"
    + allProps.map((l) => "  " + l + ",").join("\n")
    + "\n};\n"
  );
}

function writeEnvFile(path: string, file: string) {
  fs.writeFileSync(path, file);
}
