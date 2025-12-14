import { Config } from "@lib/config";

import { MonitorYamlContent, MonitorYamlFormatter } from "./formatters/monitor_yaml_formatter";
import { YamlFile } from "./yaml_file";

export class MonitorYaml extends YamlFile<MonitorYamlContent> {
  constructor(path: string) {
    super(path, new MonitorYamlFormatter());
  }

  getUrl(serviceName: string) {
    const server_name = Config.get().openshift.server_name;
    const content = this.read();
    return `http://${serviceName}-${content.namespace}.apps.${server_name}.cuyorh.tcloud.ar`;
  }

  getDoc() {
    const content = this.read();
    let out = "";
    out += "Solicitud de alta de monitor\n";
    out += `Documento de alta de servicio: ${content.services_doc_link}\n`;
    for (const s of content.services) {
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

