import { search, input, confirm } from "../../lib/ui";
import log from "../../lib/log";
import { Env, ENVS } from "../../lib/constants";
import { promptForApp, promptForOcResource } from "../../interface/prompts";
import { Config } from "../../lib/config";
import { Secret } from "../../interface/oc/secret";
import { ConfigMap } from "../../interface/oc/configmap";
import { getOcToken, Openshift } from "../../interface/oc/oc";

export default {
  command: "deploy",
  aliases: ["dep"],
  describe: "Deploy specific app version",
  handler: async () => {

    const { app_repo, deploy_repo } = await promptForApp();

    await deploy_repo.stash(async () => {
      await deploy_repo.update();
      await deploy_repo.switchBranchIfExists("master");
      // TODO: temporary until we fix repo.update
      await deploy_repo.pull();

      const choices = ENVS
        .map((e) => {
          const version = deploy_repo.getDeployment(e)?.getVersion();
          return {
            disabled: !version,
            hint: version ? `Current: ${version}` : "Missing yaml",
            name: e
          };
        });

      const selectedEnvs = await search({ message: "Select environment", multiple: true, choices }) as Env[];
      if (selectedEnvs.length === 0) return process.exit(1);

      let version = null;
      const { name } = await deploy_repo.getInfo();
      const { type } = await deploy_repo.getInfo();

      if (app_repo) {
        const tags = await app_repo.getTags();
        version = await search({ choices: tags, message: "Choose a version to deploy:" });
      } else {
        log.warning(`Tags for repository ${name} not found`);
        version = await input({ message: "Enter version to deploy, starting with a 'v':" });
      }

      await deploy_repo.update();
      await deploy_repo.createNewBranch("feature/despliegue");
      await deploy_repo.reset();

      for (const env of selectedEnvs) {
        const deploymentFile = deploy_repo.getDeployment(env);
        if (!deploymentFile) throw new Error(`Could not find deployment file for env ${env}`);

        const namespace = deploymentFile.getNamespace();
        let secrets: Secret[] = [];
        let configmaps: ConfigMap[] = [];

        const addsSecrets = await confirm({ message: "Add secrets to the deployment?", initial: false });
        const token = addsSecrets ? await getOcToken() : null;
        if (addsSecrets) {
          const project = await new Openshift(token as string).getProject(namespace);
          const secrets_available = await project.getSecrets();
          secrets = await promptForOcResource(secrets_available, { message: "Select secrets", multiple: true });
        }

        const addsConfigmaps = await confirm({ message: "Add configmaps to the deployment?", initial: false });
        if (addsConfigmaps) {
          const tokenn = token ?? await getOcToken();
          const project = await new Openshift(tokenn).getProject(namespace);
          const configmaps_availabie = await project.getConfigMaps();
          configmaps = await promptForOcResource(configmaps_availabie, { message: "Select secrets", multiple: true });
        }

        if (!Config.get().openshift.deployments?.exclude?.includes(name)
          && !Config.get().openshift.deployments?.exclude?.includes(env)
          && !Config.get().openshift.deployments?.exclude?.includes(type)
        ) deploymentFile.prepareDeploy(type);

        secrets.forEach((s) => deploymentFile.setSecret(s.name));
        configmaps.forEach((cm) => deploymentFile.setConfigMap(cm.name));
        deploymentFile.setVersion(version);
        deploymentFile.save();
        await deploy_repo.add(deploymentFile.file_path);
      }

      await deploy_repo.commit(version);
      await deploy_repo.createAndMergeMr("master");
    });
  }
};
