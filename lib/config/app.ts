import z from "zod/v4";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  open: z.object({
    token_file: z.string().optional(),
    routes_file: z.string().optional(),
    default_port: z.number().optional(),
    urls: z.record(z.string(), z.string()).optional(),
    token_app: z.string().optional(),
    data_dir: z.string().optional(),
    base_path: z.string().optional()
  }).optional()
});

type Schema = z.infer<typeof schema>;

export class AppConfig implements IntegrationConfig, Schema {
  open: Schema["open"];

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }
}
