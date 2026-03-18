import { DeployYaml } from "@files/deploy_yaml";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { Repo } from "@interface/dirs/repo";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";

export abstract class Event<T = any> {
  occurredAt = new Date();

  constructor(public ctx: T) { }
}

export class RepoEvent<T extends Repo = Repo> extends Event<T> { }
export class MrCreateEvent extends RepoEvent<RepoWithGitProvider> { }
export class CommitEvent extends RepoEvent<Repo> { }
export class DeployEvent extends Event<{ repo: DeployRepo; files: DeployYaml[] }> { }
