import { search, input, confirm, loading } from "../../lib/ui";
import log from "../../lib/log";
import { promptForApp, promptForOcResource } from "../../interface/prompts";
import { Secret } from "../../interface/oc/secret";
import { ConfigMap } from "../../interface/oc/configmap";
import { getOcToken, Openshift } from "../../interface/oc/oc";
import { setTimeout } from "node:timers/promises";
import { PipelineStatus } from "../../interface/oc/pipelinerun";

export default {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific app version",
  handler: async () => {
    const { app_repo, deploy_repo } = await promptForApp();

    const choices = deploy_repo.deployments.map((d) => {
      const version = d.getVersion();
      return {
        hint: version ? `Current: ${version}` : "Missing yaml",
        name: d.namespace
      };
    });

    const selectedNamespaces = await search({ message: "Select environment", multiple: true, choices });
    if (selectedNamespaces.length === 0) return process.exit(1);

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
        secrets = await promptForOcResource(secrets_available, { message: "Select secrets", multiple: true });
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

    const deployed = await deploy_repo.deploy(namespaces, version);
    if (!deployed) return;

    const token = await getOcToken("brc");
    const projects = await new Openshift(token, "brc").getProjects();

    const project = projects.find((p) => p.name === "cd-paas");
    if (!project) {
      log.error("Could not find cd-paas project");
      return;
    }

    const pipeline = await app_repo?.findPipeline(project, "sync");
    if (!pipeline) {
      log.error("Could not find sync pipeline");
      return;
    }

    const spinner = loading("Running pipeline");
    while (await pipeline.status() === PipelineStatus.running) setTimeout(30 * 1000);

    const status = await pipeline.status();
    if (status === PipelineStatus.succeeded) spinner.succeed("Pipeline succeeded");
    else spinner.fail("Pipeline failed");
  }
};
