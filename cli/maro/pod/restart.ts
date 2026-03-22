import { Command } from "@lib/index";
import { Deployment } from "@oc/deployment";
import { Secret } from "@oc/secret";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { DeploymentRestart } from "@steps/oc/deployments/DeploymentRestart";
import { GetDeployments } from "@steps/oc/deployments/GetDeployments";
import { PromptDeploymentSources } from "@steps/oc/deployments/PromptDeploymentSources";
import { PromptOcSecrets } from "@steps/oc/envs/PromptOcSecrets";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Workflow } from "@workflow/workflow";

const RestartCommand: Command = {
  name: "restart",
  aliases: [],
  description: "Restart rollout for pod",
  options: [
    {
      name: "secret",
      type: "boolean",
      description: "Restart all deployments affected by a secret",
      aliases: ["s"]
    },
    {
      name: "all",
      type: "boolean",
      description: "Whether to run the script for all repositories",
      aliases: ["a"]
    },
    {
      name: "frontend",
      type: "boolean",
      description: "Whether to run the script for all frontend repositories",
      aliases: ["f"]
    },
    {
      name: "backend",
      type: "boolean",
      description: "Whether to run the script for all backend repositories",
      aliases: ["b"]
    }
  ],
  run: async ({ ctx, args }) => {
    const { secret, all, frontend, backend } = args || {};
    await new Workflow([
      new PromptOcServer(),
      new PromptOcProject(),
      new GetDeployments(),
      new If({
        condition: () => Boolean(secret),
        then: new PromptOcSecrets(),
        else: new PromptDeploymentSources({
          backend: all || backend,
          frontend: all || frontend
        })
      }),
      new ForEach({
        item: "deployment",
        items: ({ deployments, secret }: { deployments: Deployment[]; secret?: Secret }) =>
          deployments.filter(
            (d) => !secret ? true : d.getSecrets()?.some((s) => s.name === secret.name)
          ),
        step: new DeploymentRestart(),
        concurrency: true
      })
    ]).run(ctx);
  }
};

export default RestartCommand;
