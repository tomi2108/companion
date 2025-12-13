import z from "zod/v4";

import { IntegrationConfig } from "./interface";

const schema = z.object({
  jira_parent_key: z.string().optional()
});

type Schema = z.infer<typeof schema>;

export class TasksConfig implements IntegrationConfig, Schema {
  jira_parent_key: Schema["jira_parent_key"];

  validate(config: unknown) {
    if (!config) return {};
    return schema.parse(config);
  }

  async setup() {
    return {};
  }

}
