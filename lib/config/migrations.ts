import z from "zod/v4";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  secrets: z.array(z.string()).optional()
});

type Schema = z.infer<typeof schema>;

export class MigrationsConfig implements IntegrationConfig, Schema {
  secrets?: Schema["secrets"];

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }

}
