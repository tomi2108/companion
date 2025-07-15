import { Config } from "@lib/config";
import JiraApi from "jira-client";

export const jira = () => new JiraApi({
  host: Config.get().jira.server,
  protocol: "https",
  username: Config.get().jira.username,
  password: Config.get().jira.token
});

