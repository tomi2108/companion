import axios from "axios";

import { EXCLUDED_SECRETS } from "@lib/constants";
import { Secret } from "@oc/secret";

export const oc = (token: string, url: string) => {
  return axios.create({
    baseURL: url,
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const filterExcludedSecrets = (s: Secret) => !EXCLUDED_SECRETS.includes(s.name);
//                                      (cm :Configmap)
export const filterExcludedConfigmaps = () => true;
// TODO(20260318-002421): not the best, find another way to filter out micro_front_end deployments
export const filterFrontendDeployments = (e: { name: string }) => e.name.startsWith("app-");
