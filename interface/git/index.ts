import simpleGit from "simple-git";

import { Dir } from "@interface/dirs/dir";

export const git = (dir: Dir) => simpleGit({
  baseDir: dir.path
});
