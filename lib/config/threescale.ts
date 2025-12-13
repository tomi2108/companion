import z from "zod/v4";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  products: z.record(z.string(), z.string()).optional()
});

type Schema = z.infer<typeof schema>;

export class ThreescaleConfig implements IntegrationConfig, Schema {
  products: Schema["products"] = {};

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }
  async setup() {
    return {};
  }

}
