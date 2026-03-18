import z from "zod/v4";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  products: z.record(z.string(), z.string()).optional()
});

export class ThreescaleConfig implements ConfigSection {
  key = "threescale";

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  help(): ConfigHelp[] {
    return [
      { key: "products", description: "Namespace to 3scale products map", type: "object" }
    ];
  }

  async setup() {
    return {};
  }

}
