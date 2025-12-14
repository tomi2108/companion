import z from "zod/v4";

import { InvalidMonitorYaml } from "@files/errors";
import { APP_TYPES } from "@lib/constants";

import { YamlFormatter } from "./yaml_formatter";

const MonitorYamlContentSchema = z.object(
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

export type MonitorYamlContent = z.infer<typeof MonitorYamlContentSchema>;

export class MonitorYamlFormatter extends YamlFormatter<MonitorYamlContent> {
  override validate(content: unknown) {
    MonitorYamlContentSchema.parse(content);
  }

  override exception(path: string): Error | void {
    return new InvalidMonitorYaml(path);
  }
}

