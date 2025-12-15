import { Gitlab } from "@gitbeaker/rest";
import simpleGit from "simple-git";

import { Dir } from "@files/dir";
import { Config } from "@lib/config";

export const git = (dir: Dir) => simpleGit({
  baseDir: dir.path
});

export const glab = () => new Gitlab({
  token: Config.get().gitlab.token,
  host: Config.get().gitlab.server
});

