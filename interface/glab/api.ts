import { Gitlab } from "@gitbeaker/rest";
import { Config } from "@lib/config";
import simpleGit from "simple-git";

export const git = (full_path: string) => simpleGit({
  baseDir: full_path
});

export const glab = () => new Gitlab({
  token: Config.get().gitlab.token,
  host: Config.get().gitlab.server
});

