import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  token: z.string()
});

type Schema = z.infer<typeof schema>;

export class SonarConfig implements IntegrationConfig, Schema {
  server = process.env.CLAIR_SONAR_SERVER ?? "";
  token: Schema["token"] = "";

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup(ctx: ExecutionContext) {
    const token = await ctx.ui.password({ message: `Enter Sonar auth token (${this.server}/account/security)` });
    return { token };
  }

}
