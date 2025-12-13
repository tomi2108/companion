import { Repo } from "@interface/dirs/repo";

export interface RepoAction {
  onMrCreate(repo: Repo): Promise<void> | void;
}
