import fs from "node:fs";
import path from "node:path";

import { AppRepo, Dependency } from "@interface/files/app_repo";
import { createDirIfNotExists, insertLine, removeLine, replace } from "@interface/files/files";
import { Repo } from "@interface/files/repo";
import { Gitlab } from "@interface/glab/glab";
import { Config } from "@lib/config";
import { APP_TYPES, AppType } from "@lib/constants";
import log from "@lib/log";
import { input, loading, search } from "@lib/ui";

const Connections = {
  apigw: "apigw",
  digit3: "digit3"
} as const;
type Connection = typeof Connections[keyof typeof Connections];

const dependenciesMap: Record<AppType, Dependency[]> = {
  app: [{
    name: "axios",
    version: "0.21.4"
  }],
  bau: [{ name: "mongoose" }],
  dao: [{ name: "sequelize" }],
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
    let connection: Connection | null = null;

    if (type === "app") {
      // TODO: Implement microfront creation
      log.error("App creation not implemented yet");
      return;
    }

    if (type === "int") {
      connection = await search({ choices: Object.values(Connections), message: "Choose connection" }) as Connection;
    }

    const dependencies = dependenciesMap[type];
    const name = await input({ message: "Enter name" });
    const description = await input({ message: "Enter description" });

    const backend_path = config.paths.backend;
    const backend_id = config.gitlab.repos.backend;
    if (!backend_id) log.error("Backend id not set");
    if (!backend_path) log.error("Backend path not set");
    if (!backend_id || !backend_path) process.exit(1);

    const full_path = path.join(backend_path, name);
    createDirIfNotExists(full_path);

    const src = path.join(full_path, "src");
    const swagger = path.join(full_path, "swagger");
    const tests = path.join(full_path, "tests");

    const configuration = path.join(src, "configuration");
    const models = path.join(src, "models");
    const services = path.join(src, "services");
    const server = path.join(src, "server", "index.ts");

    const tests_services = path.join(tests, "services");
    const tests_configuration = path.join(tests, "configuration");

    const apigw_setupTests = path.join(tests, "apigw_setupTest.ts");
    const digit3_setupTests = path.join(tests, "digit3_setupTest.ts");

    // TODO: probably make global config, not team config under Config.gitlab.ms_template_link
    const ms_template_link = "https://gitlab-ee.agil.movistar.com.ar/mimovistarempresas/backend/movistarempresas-template.git";
    const clone_spinner = loading("Cloning template");
    const new_repo = await Repo.cloneRepo(full_path, ms_template_link, true);
    clone_spinner.succeed();

    const init_spinner = loading("Initializing repository");
    fs.rmSync(path.join(new_repo.full_path, ".git"), { recursive: true });
    await new_repo.init("master");
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
        { from: path.join(configuration, "apigw_environment.ts"), to: path.join(configuration, "environment.ts") },
        { from: path.join(services, "ApigwTokenService.ts"), to: path.join(services, "TokenService.ts") },
        { from: path.join(tests_services, "apigw.test.ts"), to: path.join(tests_services, "token.test.ts") },
        { from: apigw_setupTests, to: path.join(tests, "setupTest.ts") }
      ];
      if (c === Connections.digit3) return [
        { from: path.join(configuration, "digit3_environment.ts"), to: path.join(configuration, "environment.ts") },
        { from: path.join(services, "Digit3TokenService.ts"), to: path.join(services, "TokenService.ts") },
        { from: path.join(tests_services, "digit3.test.ts"), to: path.join(tests_services, "token.test.ts") },
        { from: digit3_setupTests, to: path.join(tests, "setupTest.ts") }
      ];
      return [];
    }

    const toRemove: Record<AppType, string[]> = {
      app: [],
      bau: [...dao_files, ...int_files, ...fcd_files],
      dao: [...bau_files, ...int_files, ...fcd_files],
      fcd: [...db_files, ...int_files],
      int: [...db_files, ...getDeletedFilesFromConnections(connection), ...fcd_files]
    };
    const toMove: Record<AppType, { from: string; to: string }[]> = {
      app: [],
      bau: [
        // TODO: add tests for bau connection to template
        // { from: path.join(tests_configuration, "mongoose.tests.ts"), to: path.join(configuration, "db.tests.ts") },
        { from: path.join(configuration, "bau_db.ts"), to: path.join(configuration, "db.ts") },
        { from: path.join(configuration, "bau_environment.ts"), to: path.join(configuration, "environment.ts") }
      ],
      dao: [
        { from: path.join(tests_configuration, "sequelize.test.ts"), to: path.join(tests_configuration, "db.tests.ts") },
        { from: path.join(configuration, "dao_db.ts"), to: path.join(configuration, "db.ts") },
        { from: path.join(configuration, "dao_environment.ts"), to: path.join(configuration, "environment.ts") }
      ],
      fcd: [
        { from: path.join(configuration, "fcd_environment.ts"), to: path.join(configuration, "environment.ts") }
      ],
      int: [...getMovedFilesFromConnections(connection)]
    };
    toRemove[type].forEach((f) => fs.rmSync(f, { recursive: true, force: true }));
    toMove[type].forEach((f) => {
      fs.cpSync(f.from, f.to);
      fs.rmSync(f.from);
    });

    const replaceName = (file: string) => replace("{{name}}", name, file);
    const replaceDescription = (file: string) => replace("{{description}}", description, file);
    const replaceAuthor = (file: string) => replace("{{author}}", config.gitlab.username, file);

    replaceAuthor(path.join(full_path, "package.json"));

    replaceName(path.join(full_path, "package.json"));
    replaceDescription(path.join(full_path, "package.json"));

    replaceName(path.join(full_path, "README.md"));
    replaceDescription(path.join(full_path, "README.md"));

    replaceName(path.join(path.join(full_path, "sonar-project.properties")));

    replaceName(path.join(src, "app.ts"));
    replaceName(server);
    replaceName(path.join(src, "utils", "constant.ts"));

    replaceName(path.join(tests, "index.test.ts"));

    replaceName(path.join(swagger, "index.ts"));
    replaceDescription(path.join(swagger, "index.ts"));

    replaceName(path.join(swagger, "docs", "specification.yaml"));
    replaceDescription(path.join(swagger, "docs", "specification.yaml"));

    if (type !== "int") removeLine(7, path.join(full_path, "jest.config.js"));
    if (type === "bau") insertLine(1, server, "import \"../configuration/db\";");
    init_spinner.succeed();

    const app_repo = new AppRepo(new_repo.full_path);
    const install_spinner = loading("Installing dependencies");
    await app_repo.install(dependencies);
    install_spinner.succeed();

    await app_repo.build();
    await app_repo.test();
    await app_repo.add(".");
    await app_repo.commit("initial commit");

    const creating_spinner = loading("Creating GitLab repository");
    const glab_repo = await glab.createAppProject({ name, groupId: backend_id, description });
    const origin = glab_repo.http_url_to_repo;
    await app_repo.addOrigin(origin);
    creating_spinner.succeed();

    await app_repo.push("master");

    const replaceUrl = (file: string) => replace("{{url}}", origin, file);
    await app_repo.createNewBranch("initial_deploy");
    replaceUrl(path.join(full_path, "package.json"));
    replaceUrl(path.join(full_path, "README.md"));
    await app_repo.add("README.md");
    await app_repo.add("package.json");
    await app_repo.commit("feat: initial deploy");
    await app_repo.createAndMergeMr("master");
  }
};
