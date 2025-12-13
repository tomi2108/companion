import z from "zod/v4";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  modulo: z.string().optional()
});

type Schema = z.infer<typeof schema>;

export class DynatraceConfig implements IntegrationConfig, Schema {
  modulo: Schema["modulo"];

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }

}
