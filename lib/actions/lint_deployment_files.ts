import { DeployYamlContent } from "@files/formatters/deploy_yaml_formatter";
import { Action } from "@lib/actions";
import { DeployEvent } from "@lib/actions/events";
import { Config } from "@lib/config";
import { AppType } from "@lib/constants";
import { loading } from "@lib/decorators/ui";

import { ActionRegistry } from "./registry";

const get = <T>(obj: any, path: string): T | undefined => path.split(".").reduce((current, step) => current?.[step], obj);

function getDeploymentOption(
  path: string,
  type: AppType,
  namespace: string,
  content: DeployYamlContent
  // do not bother typing this, adds no value
): any {
  const deployments = Config.getView().get("openshift.deployments");

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

export class LintDeploymentFilesAction implements Action {

  register(): void {
    ActionRegistry.on(DeployEvent, (event) => this.execute(event));
  }

  @loading("Linting deployment files")
  // TODO(20260318-002422): fix this mess... make a way to iterate this stuff please
  async execute(event: DeployEvent) {
    const repo = event.ctx.repo;
    const files = event.ctx.files;
    const { name, type } = await repo.getInfo();

    for (const file of files) {
      if (
        Config.getView().get("openshift.deployments.exclude").includes(name)
        || Config.getView().get("openshift.deployments.exclude").includes(file.namespace)
        || Config.getView().get("openshift.deployments.exclude").includes(type)
      ) continue;

      const content = file.read();

      const secrets_to_add = getDeploymentOption("secrets", type, file.namespace, content) ?? [];
      secrets_to_add.forEach((s: string) => file.setSecret(s));

      const dynatrace = content["helm-chart-master"].dynatrace ?? {
        modulo: Config.getView().get("dynatrace.modulo") ?? "NO_INFORMADO",
        tipo: type === "app" ? "MICROFRONTEND" : type.toUpperCase(),
        clave_jira: Config.getView().get("jira.project_key") ?? "NO_INFORMADO",
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
            lproduct: Config.getView().get("openshift.product") ?? content["helm-chart-master"].labels.lproduct,
            lenvironment: file.getEnv()
          }
        }
      });
      await repo.add(file);
    }
    await repo.commit("Lint deployments");
  }
}