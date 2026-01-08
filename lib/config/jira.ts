import z from "zod/v4";

import { ExecutionContext } from "@lib/ctx";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  project_key: z.string().optional(),
  username: z.string(),
  token: z.string(),
  labels: z.array(z.string()).optional(),
  board_id: z.number().optional(),
  monitors: z.object({
    project_key: z.string().optional(),
    parent_issue_key: z.string().optional()
  })
});

type Schema = z.infer<typeof schema>;

export class JiraConfig implements IntegrationConfig, Schema {
  project_key?: Schema["project_key"];
  monitors: Schema["monitors"] = {};
  labels?: Schema["labels"];
  board_id?: Schema["board_id"];
  username: Schema["username"] = "";
  token: Schema["token"] = "";
  server = process.env.CLAIR_JIRA_SERVER ?? "";

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup(ctx: ExecutionContext) {
    const username = await ctx.ui.input({ message: "Enter Jira username" });
    const token = await ctx.ui.password({ message: "Enter Jira auth token (https://id.atlassian.com/manage-profile/security/api-tokens)" });
    return { username, token };
  }

}
