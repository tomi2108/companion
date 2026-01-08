import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  token: z.string(),
  project: z.string().optional()
});

type Schema = z.infer<typeof schema>;

export class VaultConfig implements IntegrationConfig, Schema {
  server = process.env.MARO_VAULT_SERVER ?? "";
  project?: Schema["project"];
  token = "";

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup(ctx: ExecutionContext) {
    const token = await ctx.ui.password({ message: `Enter Vault auth token (${this.server}/ui/vault/secrets)` });
    return { token };
  }

}
