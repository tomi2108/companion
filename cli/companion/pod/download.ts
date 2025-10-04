import fs from "node:fs";
import { Argv } from "yargs";

import { createLogFile } from "@files/utils";
import { promptForOcResource } from "@interface/prompts";
import { Config, ConfigError } from "@lib/config";
import log from "@lib/log";
import { tryParseJSONObject } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "download-logs",
  aliases: ["dwnld", "download"],
  describe: "Download pod logs",
  builder: (yargs: Argv) => yargs
    .boolean("raw")
    .alias("raw", ["r"])
    .describe("raw", "Whether to download raw logs, by default logs are formatted as JSON, and every line which is not valid JSON is omitted from logs"),
  handler: async ({ raw }: { raw?: boolean }) => {
    const config_log_path = Config.get().preferences.logs_path;
    if (!config_log_path) throw new ConfigError("preferences.logs_path");

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const pods = await project.getPods();
    const pod = await promptForOcResource(pods);

    const logs = await pod.getLogs();
    const formattedLogs = raw ? logs : JSON.stringify(logs.split("\n").map(tryParseJSONObject).filter(Boolean), null, 2);

    for (const p of pods.filter((p) => p.container === pod.container)) {
      const date = new Date().toISOString();
      const file_name = `[${date}]_${p.name}`;
      const full_path = createLogFile(file_name);
      if (!full_path) continue;
      fs.writeFileSync(full_path, formattedLogs);
      log.success(`Downloaded at ${full_path}`);
    }
  }
};
