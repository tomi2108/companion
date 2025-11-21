import path from "node:path";

import { executeScript } from "@interface/cmd";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import { search } from "@lib/ui";
import { readfiles } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "migration",
  describe: "Run db migrations",
  handler: async () => {
    const config = Config.get();

    const migration_secrets = config.migrations.secrets ?? [];

    const rest_path = config.paths.rest;
    if (!rest_path) throw new ConfigError("paths.rest");

    const migrations_path = path.join(rest_path, "mongo", "migrations");
    const migration_scripts = path.join(migrations_path, "src", "scripts");

    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptForOcResource(projects);

    const choices = readfiles(migration_scripts);
    const choice = await search({ message: "Choose migration to run", choices });
    const migration_file = path.join(migration_scripts, choice);

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
