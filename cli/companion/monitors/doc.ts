import fs from "node:fs";
import path from "node:path";

import { MonitorYaml } from "@files/monitor_yaml";
import { createTempFile } from "@files/utils";
import { Config, openInEditor } from "@lib/config";
import log from "@lib/log";
import { search } from "@lib/ui";
import { readdirs, readfiles } from "@lib/utils";

export default {
  command: "doc",
  aliases: ["d"],
  describe: "Genera el documento de alta de monitor para subir a Jira",
  handler: async () => {
    const rest_path = Config.get().paths.rest;
    if (!rest_path) return;

    const monitoresRoot = path.join(rest_path, "monitores");
    const namespaces = readdirs(monitoresRoot);
    if (!namespaces) return log.error(`No existe la carpeta: ${monitoresRoot}`);

    const namespace = await search({
      choices: namespaces.map((d) => d.name),
      message: "Selecciona entorno(s): Space para marcar, Enter para confirmar"
    });
    const dir = path.join(monitoresRoot, namespace);
    const files = readfiles(dir)
      .filter((e) => e.toLowerCase().endsWith(".yaml"))
      .sort((a, b) => a.localeCompare(b));

    if (files.length === 0) return log.error(`No hay archivos .yaml en: ${dir}`);

    const file = await search({
      choices: files,
      message: "Selecciona YAML(s) a convertir (Space para marcar, Enter para confirmar)"
    });

    const full_path = path.join(dir, file);
    const doc = new MonitorYaml(full_path).toString();

    const file_name = file.slice(0, -5);
    const temp_file = createTempFile(`monitor_doc_${file_name}`);
    fs.writeFileSync(temp_file, doc);
    openInEditor(temp_file);
  }
};
