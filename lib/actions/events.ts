import { Repo } from "@interface/dirs/repo";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";

export abstract class Event<T = any> {
  abstract name: string;
  occurredAt = new Date();

  constructor(public ctx: T) { }
}

export abstract class RepoEvent<T extends Repo = Repo> extends Event<T> { }
export class MrCreateEvent extends RepoEvent<RepoWithGitProvider> {
  override name = "MrCreateEvent";
}
export class CommitEvent extends RepoEvent<Repo> {
  override name = "CommitEvent";
}
