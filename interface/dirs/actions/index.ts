import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";

export abstract class RepoAction {
  protected ui = ExecutionContext.get().ui;

  abstract onMrCreate(repo: Repo): Promise<void> | void;
}
