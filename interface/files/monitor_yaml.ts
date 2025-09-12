import yaml from "js-yaml";
import fs from "node:fs";
import { z } from "zod/v4";

import { Config } from "@lib/config";
import { APP_TYPES } from "@lib/constants";

const YamlContentSchema = z.object(
  {
    name: z.string(),
    namespace: z.string(),
    date: z.string(),
    services_doc_link: z.string(),
    services: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(APP_TYPES),
        routes: z.array(
          z.object({
            endpoint: z.string(),
            method: z.enum(["GET", "POST"])
          }))
      })
    )
  }
);

type Content = z.infer<typeof YamlContentSchema>;

export class MonitorYaml {
  content: Content;
  file_path: string;

  constructor(file_path: string) {
    const file_content = fs.readFileSync(file_path).toString();
    const yaml_content = yaml.load(file_content);
    if (!yaml_content) throw new InvalidMonitorYaml(file_path);
    this.content = YamlContentSchema.parse(yaml_content);
    this.file_path = file_path;
  }

  getUrl(serviceName: string) {
    const server_name = Config.get().openshift.server_name;
    return `http://${serviceName}-${this.content.namespace}.apps.${server_name}.cuyorh.tcloud.ar`;
  }

  toString() {
    let out = "";
    out += "Solicitud de alta de monitor\n";
    out += `Flujo: ${this.content.name}\n`;
    out += `Documento de alta de servicio: ${this.content.services_doc_link}\n`;
    for (const s of this.content.services) {
      const type = s.type.toUpperCase();
      out += "\n";
      out += `${s.name} (${type})\n`;
      out += `Base URL: ${this.getUrl(s.name)}\n`;
      out += "Rutas:\n";
      for (const r of s.routes) out += `${r.method.toUpperCase()} ${r.endpoint}\n`;
      out += `Detalle funcional: ${s.description}\n`;
    }
    return out;
  }
}

export class InvalidMonitorYaml extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid deploy yaml`);
  }
}
