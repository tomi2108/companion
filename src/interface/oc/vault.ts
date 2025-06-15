import { Config } from "../../lib/config";
import v from "node-vault";

export const vault = () => v({
  endpoint: Config.get().vault.server,
  token: Config.get().vault.token,
  requestOptions: {
    headers: {
      "x-vault-token": Config.get().vault.token
    }
  },
  apiVersion: "v1"
});

