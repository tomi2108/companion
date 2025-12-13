import z from "zod/v4";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  environment_path: z.string().optional(),
  merge: z.object({
    ignores: z.array(z.string()).optional()
  }).optional()
});

type Schema = z.infer<typeof schema>;

export class ReposConfig implements IntegrationConfig, Schema {
  environment_path: Schema["environment_path"];
  merge: Schema["merge"];

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }

}
