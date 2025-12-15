import { Argv } from "yargs";

import { JsonFormatter } from "@files/formatters/json_formatter";
import { createLogFile } from "@files/utils";
import { promptForOcResource } from "@interface/prompts";
import log from "@lib/log/default";
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
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const pods = await project.getPods();
    const pod = await promptForOcResource(pods);

    const formatter = new JsonFormatter();
    const logs = await pod.getLogs();
    const formattedLogs = raw
      ? logs
      : formatter.toString(
        logs.split("\n").map((l) =>
          formatter.tryFromString(l)
        ).filter(Boolean)
      );

    for (const p of pods.filter((p) => p.container === pod.container)) {
      const date = new Date().toISOString();
      const file_name = `[${date}]_${p.name}`;
      const log_file = createLogFile(file_name);
      log_file.write(formattedLogs);
      log.success(`Downloaded at ${log_file}`);
    }
  }
};
