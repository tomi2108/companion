import v from "node-vault";

import { Config } from "@lib/config";

export const vault = () => v({
  endpoint: Config.getView().get("vault.server"),
  token: Config.getView().get("vault.token"),
  apiVersion: "v1"
});

