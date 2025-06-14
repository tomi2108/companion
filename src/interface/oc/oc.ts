import { executeScript, clearConsole } from "../cmd";
import { EXCLUDED_SECRETS } from "../../lib/constants";
import { Config } from "../../lib/config";
import axios, { AxiosInstance } from "axios";
import { Project, ProjectResponse } from "./project";
import { Secret } from "./secret";
import { base64Encode } from "../jira/jira";

export async function getOcToken(s: "cuyo" | "brc" = "cuyo") {
  const oc_config = Config.get().openshift;

  const authUrl = s === "cuyo" ? oc_config.auth_server_cuyo : oc_config.auth_server_barracas;
  const string = `${oc_config.username}:${oc_config.password}`;
  const encodedString = base64Encode(string);

  const params = {
    client_id: "openshift-challenging-client",
    code_challenge_method: "S256",
    response_type: "token",
    redirect_uri: `${authUrl}/oauth/token/implicit`,
    "X-Csrf-Token": 1
  };

  try {
    await axios.get(`${authUrl}/oauth/authorize`,
      { maxRedirects: 0, params, headers: { Authorization: `Basic ${encodedString}` } });
    return "";
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return new URLSearchParams(
        new URL(err.response?.headers.location).hash.slice(1)
      ).get("access_token") ?? "";
    }
    return "";
  }
}

export const oc = (token: string, server: "cuyo" | "brc" = "cuyo") => {
  const oc_config = Config.get().openshift;
  const s = server === "cuyo" ? oc_config.server_cuyo : oc_config.server_barracas;

  return axios.create({
    baseURL: `${s}`,
    headers: { Authorization: `Bearer ${token}` }
  });
};

export class Openshift {
  private oc: AxiosInstance;

  constructor(token: string, s: "cuyo" | "brc" = "cuyo") {
    this.oc = oc(token, s);
  }

  async getProjects() {
    return (await this.oc.get("/apis/project.openshift.io/v1/projects"))
      .data.items.map((r: ProjectResponse) => Project.fromProjectResponse(r, this.oc)) as Project[];
  }
}

export function remoteSession(pod: string) {
  clearConsole();
  return executeScript("oc/remote_session", { args: [pod] });
}

export const filterExcludedSecrets = (s: Secret) => !EXCLUDED_SECRETS.includes(s.name);
//                                      (cm :Configmap)
export const filterExcludedConfigmaps = () => true;
