import { SecretsYaml } from "@files/secrets_yaml";
import { Dir } from "@interface/dirs/dir";
import { Repo } from "@interface/dirs/repo";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";
import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";

import { WorkflowStep } from "../..";

type Reads = {
  project: Project;
  name: string;
  data: Record<string, string>;
};
type Writes = {};
type Options = {};

export class CreateSecret extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, { project, name, data }: Reads) {
    const config = Config.getView();
    const namespaces_path = config.get("paths.namespaces");
    await project.createSecret(name, data);
    const repo_path = new Dir(namespaces_path).sub(project.name);
    const secrets_file = repo_path.getFile("values.yaml");
    const repo = new Repo(repo_path);
    return await repo.stash(async () => {
      await repo.update();
      const { original_branch } = await repo.switchBranchIfExists("master");
      const master_file = new SecretsYaml(secrets_file.path);
      if (!master_file.hasSecret(name)) {
        const temp_branch = `feature/add-secret-${name}`;
        await repo.createNewBranch(temp_branch);
        const file = new SecretsYaml(secrets_file.path);
        file.addSecret(name);
        file.save();
        await repo.add(secrets_file);
        await repo.commit(name);
        await new RepoWithGitProvider(repo, ctx.gitProvider).createAndMergeMr("master");
        await repo.switchBranchIfExists("master");
        await repo.deleteBranch(temp_branch);
      }
      await repo.switchBranchIfExists(original_branch);
      return {};
    });
  }
}
