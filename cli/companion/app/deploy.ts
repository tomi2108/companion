import { promptForOcResource } from "@interface/prompts";
import { ExecutionContext } from "@lib/ctx";
import log from "@lib/log/default";
import { confirm, input, loading, search } from "@lib/ui";
import { PromptApp } from "@lib/workflow/steps/app/prompt_app";
import { PromptNamespaceDeploy } from "@lib/workflow/steps/app/prompt_namespace_deploy";
import { Workflow } from "@lib/workflow/workflow";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";
import { findSyncPipeline, waitForPipeline } from "@oc/utils";

export default {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific app version",
  handler: async () => {

    const ctx = ExecutionContext.get();
    new Workflow([
      new PromptApp(),
      new PromptNamespaceDeploy()
    ]).run(ctx, undefined);

    const versionsSpinner = loading("Getting versions");
    let version = null;
    if (app_repo) {
      const tags = await app_repo.getTags();
      versionsSpinner.succeed();
      version = await search({ choices: tags, message: "Choose a version to deploy:" });
    } else {
      versionsSpinner.fail();
      log.warning("Tags not found");
      version = await input({ message: "Enter version to deploy, starting with a 'v':" });
    }

    const namespaces: { name: string; secrets: Secret[]; configmaps: ConfigMap[] }[] = [];
    for (const namespace of selectedNamespaces) {
      const addsSecrets = await confirm({ message: `Add secrets to the deployment? (${namespace})`, initial: false });
      const token = addsSecrets ? await getOcToken() : null;
      let secrets: Secret[] = [];
      let configmaps: ConfigMap[] = [];

      if (addsSecrets) {
        const project = await new Openshift(token as string).getProject(namespace);
        const secrets_available = await project.getSecrets();
        secrets = await promptForOcResource(secrets_available, { message: "Select configmaps", multiple: true });
      }

      const addsConfigmaps = await confirm({ message: `Add configmaps to the deployment? (${namespace})`, initial: false });
      if (addsConfigmaps) {
        const tokenn = token ?? await getOcToken();
        const project = await new Openshift(tokenn).getProject(namespace);
        const configmaps_availabie = await project.getConfigMaps();
        configmaps = await promptForOcResource(configmaps_availabie, { message: "Select secrets", multiple: true });
      }

      namespaces.push({ name: namespace, secrets, configmaps });
    }

    if (!app_repo) return;
    const deployed = await deploy_repo.deploy(namespaces, version);
    if (!deployed) return;

    const pipeline = await findSyncPipeline(app_repo);
    if (!pipeline) return log.error("Could not find sync pipeline");
    await waitForPipeline(pipeline);
  }
};
