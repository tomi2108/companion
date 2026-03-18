import { Gitlab } from "@gitbeaker/rest";

export type GitlabCredentials = { token: string; server: string };
export const glab = ({ token, server }: GitlabCredentials) => new Gitlab({ token, host: server });
