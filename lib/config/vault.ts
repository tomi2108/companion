import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  server: z.string(),
  token: z.string(),
  project: z.string().optional()
});

export class VaultConfig implements ConfigSection {
  key = "vault";

  defaults(): Record<string, unknown> {
    return {
      server: process.env.MARO_VAULT_SERVER ?? ""
    };
  }

  help(): ConfigHelp[] {
    return [
      { key: "server", description: "Vault server URL", type: "string" },
      { key: "token", description: "Vault authentication token", type: "string" },
      { key: "project", description: "Default Vault project or namespace", type: "string" }
    ];
  }

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup(ctx: ExecutionContext) {
    const token = await ctx.ui.password({ message: "Enter Vault auth token" });
    return { token };
  }

}
