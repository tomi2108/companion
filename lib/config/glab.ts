import z from "zod/v4";

import { input, password } from "@lib/ui";

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
  server = process.env.COMPANION_GLAB_SERVER ?? "";
  ms_template_id = Number(process.env.COMPANION_GLAB_MS_TEMPLATE_ID) ?? -1;
  mf_template_id = Number(process.env.COMPANION_GLAB_MF_TEMPLATE_ID) ?? -1;
  repos: { [K in PathKey]?: number } = {};
  ci_webhook: Schema["ci_webhook"];
  default_reviewer: Schema["default_reviewer"];

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup() {
    const username = await input({ message: "Enter Gitlab username" });
    const token = await password({ message: `Enter Gitlab auth token (${this.server}/-/user_settings/personal_access_tokens)` });
    return { username, token };
  }

}
