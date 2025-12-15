import { Dir } from "@files/dir";
import { createLogFile } from "@files/utils";
import { executeScript } from "@interface/cmd";
import { AppRepo } from "@interface/dirs/app_repo";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log/default";
import { loading, search } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "migration",
  aliases: ["migrations"],
  describe: "Run MongoDb migrations",
  handler: async () => {
    const config = Config.get();
    const migration_secrets = config.migrations.secrets ?? [];

    const mongo_path = config.paths.mongo;
    if (!mongo_path) throw new ConfigError("paths.mongo");

    const migrations_dir = new Dir(mongo_path);
    const migration_scripts = migrations_dir.sub("src", "migrations");

    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptForOcResource(projects);

    const choices = migration_scripts.readFiles().map((f) => f.toChoice());
    const choice = await search({ message: "Choose migration to run", choices });
    const migration_file = migration_scripts.getFile(choice);

    const repo = new AppRepo(migrations_dir);
    if (!migrations_dir.sub("node_modules").exists()) {
      const spinner = loading("Installing missing dependencies");
      await repo.install();
      spinner.succeed();
    }

    const secrets = await project.getSecrets();
    const env = (await Promise.all(secrets
      .filter((s) => migration_secrets.includes(s.name))
      .map((s) => s.getData())
    )).reduce((acc, curr) => ({ ...acc, ...curr }));

    const output = executeScript("node", {
      path: "",
      env,
      supressStdout: true,
      args: [migration_file.path],
      cwd: migration_scripts.path
    });

    const log_dir = new Dir("mongo").sub("scripts", migration_file.name({ extension: false }));
    const log_file = createLogFile(new Date().toISOString(), log_dir);
    log_file.write(output);
    log.info(`Log file written at ${log_file.path}`);
  }
};
