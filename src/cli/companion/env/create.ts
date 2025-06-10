#!/usr/bin/env node

import { login, createEnv } from "../../../interface/oc";
import log from "../../../lib/log";
import { search, input } from "../../../lib/ui";
import fs from "node:fs";
import { promptForOcProject, promptTmpFile } from "../../../interface/prompts";

export default {
  command: "create",
  aliases: [],
  describe: "Create configmap or secret",
  handler: async () => {
    login();

    const project = await promptForOcProject();

    const choices = ["configmap", "secret"];
    const resource = await search({ message: "Choose type of resource to edit", choices }) as unknown as string;
    if (!resource) process.exit(1);

    const type = {
      configmap: "configmap",
      secret: "secret generic"
    }[resource];

    const name = await input({ message: `Enter a name for the new ${resource}` });
    if (!name) process.exit(1);

    const { changed, file_path } = promptTmpFile(`${name}-${resource}`, "KEY=VALUE");

    if (changed) {
      log.info("Create canceled, no changes made");
      fs.rmSync(file_path);
      process.exit(0);
    }

    createEnv(project, type!, name, file_path);
    fs.rmSync(file_path);
  }
};
