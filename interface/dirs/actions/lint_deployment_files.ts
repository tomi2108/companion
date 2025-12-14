import { DeployYamlContent } from "@files/formatters/deploy_yaml_formatter";
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
  content: DeployYamlContent
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

  return get(content, path);
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

      const content = file.read();

      const secrets_to_add = getDeploymentOption("secrets", type, file.namespace, content) ?? [];
      secrets_to_add.forEach((s: string) => file.setSecret(s));

      const dynatrace = content["helm-chart-master"].dynatrace ?? {
        modulo: Config.get().dynatrace?.modulo ?? "NO_INFORMADO",
        tipo: type === "app" ? "MICROFRONTEND" : type.toUpperCase(),
        clave_jira: Config.get().jira?.project_key ?? "NO_INFORMADO",
        issue_jira: "NO_INFORMADO",
        masivo_critico: "NO"
      };

      file.writePartial({
        "helm-chart-master": {
          dynatrace,
          route: {
            enabled: getDeploymentOption("route.enabled", type, file.namespace, content)
          },
          resources: {
            limits: {
              cpu: getDeploymentOption("resources.limits.cpu", type, file.namespace, content),
              memory: getDeploymentOption("resources.limits.memory", type, file.namespace, content)
            },
            requests: {
              cpu: getDeploymentOption("resources.requests.cpu", type, file.namespace, content),
              memory: getDeploymentOption("resources.requests.memory", type, file.namespace, content)
            }
          },
          autoscaling: {
            enabled: getDeploymentOption("autoscaling.enabled", type, file.namespace, content),
            minReplicas: getDeploymentOption("autoscaling.minReplicas", type, file.namespace, content),
            maxReplicas: getDeploymentOption("autoscaling.maxReplicas", type, file.namespace, content)
          },
          readinessProbe: {
            enabled: getDeploymentOption("readinessProbe.enabled", type, file.namespace, content)
          },
          configmapENV: {
            ELK_LOGS: getDeploymentOption("configmapENV.ELK_LOGS", type, file.namespace, content),
            ELK_LOGS_DEBUG: getDeploymentOption("configmapENV.ELK_LOGS_DEBUG", type, file.namespace, content),
            STDOUT_LOGS: getDeploymentOption("configmapENV.STDOUT_LOGS", type, file.namespace, content)
          },
          labels: {
            lproduct: Config.get().openshift.product ?? content["helm-chart-master"].labels.lproduct,
            lenvironment: file.getEnv()
          }
        }
      });
      await repo.add(file);
    }
    await repo.commit("Lint deployments");

    spinner.succeed();
  }

}

