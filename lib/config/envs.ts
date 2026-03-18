import z from "zod/v4";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  health_exclusions: z.array(z.string()).optional(),
  generate: z.object({
    prefix: z.string().optional(),
    exclusions: z.array(z.string()).optional(),
    prefix_exclusions: z.array(z.string()).optional()
  }).optional()
});

export class EnvsConfig implements ConfigSection {
  key = "envs";

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  help(): ConfigHelp[] {
    return [
      { key: "health_exclusions", description: "Env keys ignored in health checks", type: "string[]" },
      { key: "generate.prefix", description: "Prefix removed when generating env names", type: "string" },
      { key: "generate.exclusions", description: "Names excluded from configmap generation", type: "string[]" },
      { key: "generate.prefix_exclusions", description: "Prefixes excluded from configmap generation", type: "string[]" }
    ];
  }

  async setup() {
    return {};
  }

}
