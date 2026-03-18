import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { ConfigHelp, ConfigSection } from "./interface";

const schema = z.object({
  server: z.string(),
  ms_template_id: z.number(),
  mf_template_id: z.number(),
  token: z.string(),
  username: z.string(),
  default_reviewer: z.string().optional(),
  ci_webhook: z.object({
    url: z.string(),
    token: z.string()
  }).optional()
});

export class GitlabConfig implements ConfigSection {
  key = "gitlab";

  defaults(): Record<string, unknown> {
    return {
      server: process.env.MARO_GLAB_SERVER ?? "",
      ms_template_id: Number(process.env.MARO_GLAB_MS_TEMPLATE_ID ?? 0),
      mf_template_id: Number(process.env.MARO_GLAB_MF_TEMPLATE_ID ?? 0)
    };
  }

  help(): ConfigHelp[] {
    return [
      { key: "server", description: "GitLab server URL", type: "string" },
      { key: "ms_template_id", description: "GitLab MS (microservice) template project ID", type: "number" },
      { key: "mf_template_id", description: "GitLab MF (monofunctional) template project ID", type: "number" },
      { key: "token", description: "GitLab personal access token", type: "string" },
      { key: "username", description: "GitLab username", type: "string" },
      { key: "default_reviewer", description: "Default merge request reviewer", type: "string" },
      { key: "ci_webhook.url", description: "CI webhook URL", type: "string" },
      { key: "ci_webhook.token", description: "CI webhook token", type: "string" }
    ];
  }

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup(ctx: ExecutionContext) {
    const username = await ctx.ui.input({ message: "Enter Gitlab username" });
    const token = await ctx.ui.password({ message: "Enter Gitlab auth token" });
    return { username, token };
  }

}
