import v from "node-vault";

import { Config } from "../../lib/config";

export const vault = () => v({
  endpoint: Config.get().vault.server,
  token: Config.get().vault.token,
  apiVersion: "v1"
});

