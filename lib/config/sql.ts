import z from "zod/v4";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  credentials: z.record(
    z.string(),
    z.object({
      user: z.string(),
      password: z.string(),
      port: z.number().optional(),
      server: z.string(),
      db: z.string()
    }).optional()
  ).optional()
});

export class SqlConfig implements ConfigSection {
  key = "sql";

  help(): ConfigHelp[] {
    return [
      { key: "credentials", description: "Namespace to SQL credentials map", type: "object" },
      { key: "credentials.${namespace}.user", description: "Database user", type: "string" },
      { key: "credentials.${namespace}.password", description: "Database password", type: "string" },
      { key: "credentials.${namespace}.port", description: "Database port", type: "number" },
      { key: "credentials.${namespace}.server", description: "Database server", type: "string" },
      { key: "credentials.${namespace}.db", description: "Database name", type: "string" }
    ];
  }

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }

}
