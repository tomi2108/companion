import axios from "axios";

import { base64Encode } from "@files/utils";
import { Config } from "@lib/config";
import { EXCLUDED_SECRETS } from "@lib/constants";
import { Secret } from "@oc/secret";

export async function getOcToken(s: "cuyo" | "brc" = "cuyo") {
  const oc_config = Config.get().openshift;

  const authUrl = {
    cuyo: oc_config.auth_server_cuyo,
    brc: oc_config.auth_server_barracas
  }[s];
  const string = `${oc_config.username}:${oc_config.password}`;
  const encodedString = base64Encode(string);

  const params = {
    client_id: "openshift-challenging-client",
    code_challenge_method: "S256",
    response_type: "token",
    redirect_uri: `${authUrl}/oauth/token/implicit`
  };
  const headers = {
    Authorization: `Basic ${encodedString}`,
    "X-CSRF-Token": "1"
  };
  try {
    await axios.get(`${authUrl}/oauth/authorize`, { maxRedirects: 0, params, headers });
    return "";
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.headers.location) {
      return new URLSearchParams(
        new URL(err.response?.headers.location).hash.slice(1)
      ).get("access_token") ?? "";
    } else {
      console.dir(err, { depth: null });
      throw err;
    }
  }
}

export const oc = (token: string, server: "cuyo" | "brc" = "cuyo") => {
  const oc_config = Config.get().openshift;
  const s = {
    cuyo: oc_config.server_cuyo,
    brc: oc_config.server_barracas
  }[server];

  return axios.create({
    baseURL: `https://${s}`,
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const filterExcludedSecrets = (s: Secret) => !EXCLUDED_SECRETS.includes(s.name);
//                                      (cm :Configmap)
export const filterExcludedConfigmaps = () => true;
// TODO: not the best, find another way to filter out micro_front_end deployments
export const filterFrontendDeployments = (e: { name: string }) => e.name.startsWith("app-");
