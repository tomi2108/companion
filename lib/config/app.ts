import z from "zod/v4";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  open: z.object({
    token_file: z.string().optional(),
    routes_file: z.string().optional(),
    default_port: z.number().optional(),
    urls: z.record(z.string(), z.string()).optional(),
    token_app: z.string().optional(),
    data_dir: z.string().optional(),
    base_path: z.string().optional()
  }).optional(),
  status: z.object({
    exclusions: z.array(z.string())
  })
});

export class AppConfig implements ConfigSection {
  key = "app";

  defaults(): Record<string, unknown> {
    return {
      status: {
        exclusions: []
      }
    };
  }

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  help(): ConfigHelp[] {
    return [
      { key: "open.token_file", description: "HTTP file used to request a token", type: "string" },
      { key: "open.routes_file", description: "File with available routes", type: "string" },
      { key: "open.default_port", description: "Local port when running in local mode", type: "number" },
      { key: "open.urls", description: "Map of named URLs", type: "object" },
      { key: "open.token_app", description: "App name used to build the token URL", type: "string" },
      { key: "open.data_dir", description: "Directory with JSON payload data", type: "string" },
      { key: "open.base_path", description: "Prefix added to the selected route", type: "string" },
      { key: "status.exclusions", description: "Items excluded from status checks", type: "string[]" }
    ];
  }

  async setup() {
    return {};
  }
}
