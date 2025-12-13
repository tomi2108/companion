import z from "zod/v4";

import { input, password } from "@lib/ui";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  project_key: z.string().optional(),
  username: z.string(),
  token: z.string(),
  labels: z.array(z.string()).optional(),
  board_id: z.number().optional(),
  monitors_project_key: z.string().optional(),
  monitors_parent_issue_key: z.string().optional()
});

type Schema = z.infer<typeof schema>;

export class JiraConfig implements IntegrationConfig, Schema {
  project_key?: Schema["project_key"];
  monitors_project_key?: Schema["project_key"];
  labels?: Schema["labels"];
  monitors_parent_issue_key?: Schema["project_key"];
  board_id?: Schema["board_id"];
  username: Schema["username"] = "";
  token: Schema["token"] = "";
  server = process.env.COMPANION_JIRA_SERVER ?? "";

  validate(config: unknown) {
    return schema.parse(config);
  }

  async setup() {
    const username = await input({ message: "Enter Jira username" });
    const token = await password({ message: "Enter Jira auth token (https://id.atlassian.com/manage-profile/security/api-tokens)" });
    return { username, token };
  }

}
