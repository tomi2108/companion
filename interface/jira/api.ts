import JiraApi from "jira-client";

import { Config } from "@lib/config";

export const jira = () => new JiraApi({
  host: Config.get().jira.server,
  protocol: "https",
  username: Config.get().jira.username,
  password: Config.get().jira.token
});

