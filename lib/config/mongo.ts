import z from "zod/v4";

import { IntegrationConfig } from "./interface";

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
  )
});

type Schema = z.infer<typeof schema>;

export class MongoConfig implements IntegrationConfig, Schema {
  credentials: Schema["credentials"] = {};

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }

}
