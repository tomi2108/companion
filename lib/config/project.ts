import z from "zod/v4";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  copy: z.object({
    exclusions: z.array(z.string()).optional()
  }).optional()
});

type Schema = z.infer<typeof schema>;

export class ProjectConfig implements IntegrationConfig, Schema {
  copy: Schema["copy"];

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }

}
