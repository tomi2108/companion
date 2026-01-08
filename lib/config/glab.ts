import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { IntegrationConfig } from "./interface";
import { PathKey } from "./paths";

const schema = z.object({
  token: z.string(),
  username: z.string(),
  default_reviewer: z.string().optional(),
  ci_webhook: z.object({
    url: z.string(),
    token: z.string()
  }).optional()
});

type Schema = z.infer<typeof schema>;

export class GitlabConfig implements IntegrationConfig, Schema {
  username: Schema["username"] = "";
  token: Schema["token"] = "";
  server = process.env.DUX_GLAB_SERVER ?? "";
  ms_template_id = Number(process.env.DUX_GLAB_MS_TEMPLATE_ID) ?? -1;
  mf_template_id = Number(process.env.DUX_GLAB_MF_TEMPLATE_ID) ?? -1;
  repos: { [K in PathKey]?: number } = {};
  ci_webhook: Schema["ci_webhook"];
  default_reviewer: Schema["default_reviewer"];

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup(ctx: ExecutionContext) {
    const username = await ctx.ui.input({ message: "Enter Gitlab username" });
    const token = await ctx.ui.password({ message: `Enter Gitlab auth token (${this.server}/-/user_settings/personal_access_tokens)` });
    return { username, token };
  }

}
