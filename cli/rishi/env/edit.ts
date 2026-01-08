import { ExecutionContext } from "@lib/ctx";
import { ConfigMap } from "@oc/configmap";
import { Deployment } from "@oc/deployment";
import { Secret } from "@oc/secret";
import { ValidateConfig } from "@steps/config/ValidateConfig";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { Sleep } from "@steps/flow/Sleep";
import { DeploymentRestart } from "@steps/oc/deployments/DeploymentRestart";
import { GetDeployments } from "@steps/oc/deployments/GetDeployments";
import { EditConfigMap } from "@steps/oc/envs/EditConfigmap";
import { EditSecret } from "@steps/oc/envs/EditSecret";
import { PromptOcConfigMaps } from "@steps/oc/envs/PromptOcConfigMaps";
import { PromptOcSecrets } from "@steps/oc/envs/PromptOcSecrets";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { Search } from "@steps/ui/Search";
import { Spinner } from "@steps/ui/Spinner";
import { Workflow } from "@workflow/workflow";

export default {
  command: "edit",
  aliases: ["e"],
  describe: "Edit configmap or secret",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const choices = ["configmap", "secret"] as const;
    await new Workflow([
      new ValidateConfig({ keys: ["paths.namespaces"] }),
      new PromptOcProject({ server: "cuyo" }),
      new Search({
        choices,
        message: "Choose type of resource to edit"
      }),
      new If({
        condition: ({ choice }: { choice: typeof choices[number] }) => choice === "configmap",
        then: new Workflow([
          new PromptOcConfigMaps(),
          new EditConfigMap()
        ]),
        else: new Workflow([
          new PromptOcSecrets(),
          new EditSecret()
        ])
      }),
      new If({
        condition: async ({ configmap, secret }: { configmap?: ConfigMap; secret?: Secret }) => {
          const resource = configmap ?? secret;
          if (!resource) throw new Error("No resource found in env edit");
          return await ctx.ui.confirm({
            initial: true,
            message: `Do you want to restart every deployment affected by ${resource.name}?`
          });
        },
        then: new Workflow([
          new Spinner({
            step: new Sleep({ seconds: 10 }),
            message: "Restarting"
          }),
          new GetDeployments(),
          new ForEach({
            concurrency: true,
            item: "deployment",
            step: new DeploymentRestart(),
            items: (state: {
              secret?: Secret;
              configmap?: ConfigMap;
              deployments: Deployment[];
            }) => state.deployments
              .filter(async (d) =>
                d.getSecrets()?.some((s) => s.name === state.secret?.name)
                || (await d.getConfigMaps())?.some((cm) => cm.name === state.configmap?.name)
              )
          })
        ])
      })
    ]).run(ctx);
  }
};
