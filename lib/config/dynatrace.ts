import z from "zod/v4";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  modulo: z.string().optional()
});

export class DynatraceConfig implements ConfigSection {
  key = "dynatrace";

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  help(): ConfigHelp[] {
    return [
      { key: "modulo", description: "Default Dynatrace module value for deployments", type: "string" }
    ];
  }

  async setup() {
    return {};
  }

}
