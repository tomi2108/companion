import z from "zod/v4";

import { password } from "@lib/ui";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  token: z.string(),
  project: z.string().optional()
});

type Schema = z.infer<typeof schema>;

export class VaultConfig implements IntegrationConfig, Schema {
  server = process.env.RISHI_VAULT_SERVER ?? "";
  project?: Schema["project"];
  token = "";

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup() {
    const token = await password({ message: `Enter Vault auth token (${this.server}/ui/vault/secrets)` });
    return { token };
  }

}
