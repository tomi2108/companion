import z from "zod/v4";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  copy: z.object({
    exclusions: z.array(z.string()).optional()
  }).optional()
});

export class ProjectConfig implements ConfigSection {
  key = "project";

  help(): ConfigHelp[] {
    return [
      { key: "copy.exclusions", description: "App names excluded from copy operations", type: "string[]" }
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
