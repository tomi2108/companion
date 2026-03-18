import z from "zod/v4";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  environment_path: z.string().optional(),
  merge: z.object({
    ignores: z.array(z.string()).optional()
  }).optional()
});

export class ReposConfig implements ConfigSection {
  key = "repos";

  help(): ConfigHelp[] {
    return [
      { key: "environment_path", description: "Path to the environment file in app repositories", type: "string" },
      { key: "merge.ignores", description: "App names excluded from merge operations", type: "string[]" }
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
