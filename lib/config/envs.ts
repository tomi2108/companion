import z from "zod/v4";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  health_exclusions: z.array(z.string()).optional(),
  generate: z.object({
    prefix: z.string().optional(),
    exclusions: z.array(z.string()).optional(),
    prefix_exclusions: z.array(z.string()).optional()
  }).optional()
});

type Schema = z.infer<typeof schema>;

export class EnvsConfig implements IntegrationConfig, Schema {
  generate: Schema["generate"];
  health_exclusions: Schema["health_exclusions"];

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }

}
