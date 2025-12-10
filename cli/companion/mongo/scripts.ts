import fs from "node:fs";
import path from "node:path";

import { executeScript } from "@interface/cmd";
import { AppRepo } from "@interface/dirs/app_repo";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import { loading, search } from "@lib/ui";
import { readfiles } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "script",
  aliases: ["scripts"],
  describe: "Run MongoDb scripts",
  handler: async () => {
    const config = Config.get();
    const migration_secrets = config.migrations.secrets ?? [];

    const mongo_path = config.paths.mongo;
    if (!mongo_path) throw new ConfigError("paths.mongo");

    const migration_scripts = path.join(mongo_path, "src", "scripts");

    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptForOcResource(projects);

    const choices = readfiles(migration_scripts);
    const choice = await search({ message: "Choose migration to run", choices });
    const migration_file = path.join(migration_scripts, choice);

    const repo = new AppRepo(mongo_path);
    const node_modules = fs.existsSync(path.join(mongo_path, "node_modules"));
    if (!node_modules) {
      const spinner = loading("Installing missing dependencies");
      await repo.install();
      spinner.succeed();
    }

    const secrets = await project.getSecrets();
    const env = (await Promise.all(secrets
      .filter((s) => migration_secrets.includes(s.name))
      .map((s) => s.getData())
    )).reduce((acc, curr) => ({ ...acc, ...curr }));

    executeScript("node", {
      path: "",
      env,
      args: [migration_file],
      cwd: migration_scripts
    });
  }
};
