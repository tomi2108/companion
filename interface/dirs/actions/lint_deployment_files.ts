import { DeployYamlContent } from "@files/validations";
import { Config } from "@lib/config";
import { AppType } from "@lib/constants";
import { loading } from "@lib/ui";

import { RepoAction } from ".";
import { DeployRepo } from "../deploy_repo";

const get = <T>(obj: any, path: string): T | undefined => path.split(".").reduce((current, step) => current?.[step], obj);

function getDeploymentOption(
  path: string,
  type: AppType,
  namespace: string,
  y: DeployYamlContent
  // do not bother typing this, adds no value
): any {
  const deployments = Config.get().openshift?.deployments as any;

  const env_type_value = get(deployments?.[namespace]?.[type], path);
  if (env_type_value !== null && env_type_value !== undefined) return env_type_value;

  const type_env_value = get(deployments?.[type]?.[namespace], path);
  if (type_env_value !== null && type_env_value !== undefined) return type_env_value;

  const type_value = get(deployments?.[type], path);
  if (type_value !== null && type_value !== undefined) return type_value;

  const env_value = get(deployments?.[namespace], path);
  if (env_value !== null && env_value !== undefined) return env_value;

  const deployment_value = get(deployments, path);
  if (deployment_value !== null && deployment_value !== undefined) return deployment_value;

  return get(y, path);
}

export class LintDeploymentFilesAction implements RepoAction {
  // TODO: fix this mess... make a way to iterate this stuff please
  async onMrCreate(repo: DeployRepo) {
    const spinner = loading("Preparing deploy files");
    // TODO: run only for touched deployments
    const files = repo.deployments;
    const { name, type } = await repo.getInfo();

    for (const file of files) {
      if (Config.get().openshift.deployments?.exclude?.includes(name)
        && Config.get().openshift.deployments?.exclude?.includes(file.namespace)
        && Config.get().openshift.deployments?.exclude?.includes(type)
      ) continue;

      const secrets_to_add = getDeploymentOption("secrets", type, file.namespace, file.content) ?? [];
      secrets_to_add.forEach((s: string) => file.setSecret(s));

      if (!file.content.dynatrace) file.content.dynatrace = {
        modulo: Config.get().dynatrace?.modulo ?? "NO_INFORMADO",
        tipo: type === "app" ? "MICROFRONTEND" : type.toUpperCase(),
        clave_jira: Config.get().jira?.project_key ?? "NO_INFORMADO",
        issue_jira: "NO_INFORMADO",
        masivo_critico: "NO"
      };

      file.content.route.enabled = getDeploymentOption("route.enabled", type, file.namespace, file.content);

      file.content.resources.limits.cpu = getDeploymentOption("resources.limits.cpu", type, file.namespace, file.content);
      file.content.resources.limits.memory = getDeploymentOption("resources.limits.memory", type, file.namespace, file.content);

      file.content.resources.requests.cpu = getDeploymentOption("resources.requests.cpu", type, file.namespace, file.content);
      file.content.resources.requests.memory = getDeploymentOption("resources.requests.memory", type, file.namespace, file.content);

      file.content.autoscaling.enabled = getDeploymentOption("autoscaling.enabled", type, file.namespace, file.content);
      file.content.autoscaling.minReplicas = getDeploymentOption("autoscaling.minReplicas", type, file.namespace, file.content);
      file.content.autoscaling.maxReplicas = getDeploymentOption("autoscaling.maxReplicas", type, file.namespace, file.content);

      file.content.readinessProbe.enabled = getDeploymentOption("readinessProbe.enabled", type, file.namespace, file.content);

      file.content.configmapENV.ELK_LOGS = getDeploymentOption("configmapENV.ELK_LOGS", type, file.namespace, file.content);
      file.content.configmapENV.ELK_LOGS_DEBUG = getDeploymentOption("configmapENV.ELK_LOGS_DEBUG", type, file.namespace, file.content);
      file.content.configmapENV.STDOUT_LOGS = getDeploymentOption("configmapENV.STDOUT_LOGS", type, file.namespace, file.content);

      file.content.labels.lproduct = Config.get().openshift.product ?? file.content.labels.lproduct;
      file.content.labels.lenvironment = file.getEnv();
      file.save();
      await repo.add(file);
    }
    await repo.commit("Lint deployments");

    spinner.succeed();
  }

}

