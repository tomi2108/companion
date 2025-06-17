import fs, { Dirent } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { Env, ENVS, MsType } from "../../lib/constants";
import { getDeploymentOption } from "./files";
import { Config } from "../../lib/config";

export class DeployYaml {
  file_path: string;
  env?: Env;
  // TODO: type content
  content: any;

  static isDeployYamlFile(file: Dirent) {
    return file.isFile()
      && ENVS.some((e) => file.name.includes(e))
      && file.name.includes("values-");
    // TODO: probably look for "helm-chart"
    // && fs.readFileSync(file.);
  }

  constructor(file_path: string) {
    const file_content = fs.readFileSync(file_path).toString();
    const yaml_content = (yaml.load(file_content) as { "helm-chart-master": any })?.["helm-chart-master"];
    if (!yaml_content) throw new InvalidDeployYaml(file_path);

    this.content = yaml_content;
    this.file_path = file_path;
    this.env = ENVS.find((e) => path.basename(file_path).includes(e));
  }

  async prepareDeploy(type: MsType) {
    if (!this.env) throw new Error(`Could not determine env for ${this.file_path}`);

    if (type !== "app") this.setSecret("elasticsearch");
    if (!this.content.dynatrace) this.content.dynatrace = {};
    this.content.dynatrace.modulo = Config.get().dynatrace?.modulo ?? this.content.dynatrace.modulo ?? "NO_INFORMADO";
    this.content.dynatrace.tipo = type === "app" ? "MICROFRONTEND" : type.toUpperCase();
    this.content.dynatrace.clave_jira = Config.get().jira?.project_key ?? this.content.dynatrace.clave_jira ?? "NO_INFORMADO";
    // TODO: vincular con Jira ?
    this.content.dynatrace.masivo_critico = "NO";
    this.content.dynatrace.issue_jira = "NO_INFORMADO";

    this.content.route.enabled = getDeploymentOption("route.enabled", type, this.env, this.content);

    this.content.resources.limits.cpu = getDeploymentOption("resources.limits.cpu", type, this.env, this.content);
    this.content.resources.limits.memory = getDeploymentOption("resources.limits.memory", type, this.env, this.content);

    this.content.resources.requests.cpu = getDeploymentOption("resources.requests.cpu", type, this.env, this.content);
    this.content.resources.requests.memory = getDeploymentOption("resources.requests.memory", type, this.env, this.content);

    this.content.autoscaling.enabled = getDeploymentOption("autoscaling.enabled", type, this.env, this.content);
    this.content.autoscaling.minReplicas = getDeploymentOption("autoscaling.minReplicas", type, this.env, this.content);
    this.content.autoscaling.maxReplicas = getDeploymentOption("autoscaling.maxReplicas", type, this.env, this.content);

    this.content.readinessProbe.enabled = getDeploymentOption("readinessProbe.enabled", type, this.env, this.content);

    this.content.configmapENV.ELK_LOGS = getDeploymentOption("configmapENV.ELK_LOGS", type, this.env, this.content);
    this.content.configmapENV.ELK_LOGS_DEBUG = getDeploymentOption("configmapENV.ELK_LOGS_DEBUG", type, this.env, this.content);
    this.content.configmapENV.STDOUT_LOGS = getDeploymentOption("configmapENV.STDOUT_LOGS", type, this.env, this.content);

    this.content.labels.lproduct = Config.get().openshift.product ?? this.content.labels.lproduct;
    this.content.labels.lenvironment = this.env;
    return this.content;
  }

  toString() {
    return yaml.dump({ "helm-chart-master": this.content });
  }

  save() {
    const string = this.toString();
    fs.writeFileSync(this.file_path, string);
  }

  isEnv(env: Env) {
    return this.env === env;
  }

  setVersion(version: string) {
    this.content.image.tag = version;
  }

  setSecret(name: string) {
    const values = Object.values(this.content.secrets);
    if (values.includes(name)) return;
    const i = values.length;
    this.content.secrets[`secret${i + 1}`] = name;
  }

  setConfigMap(name: string) {
    const values = Object.values(this.content.configmaps);
    if (values.includes(name)) return;
    const i = values.length;
    this.content.configmaps[`configmap${i + 1}`] = name;
  }

  getVersion() {
    return this.content.image.tag;
  }

  getNamespace() {
    return path.basename(this.file_path, ".yaml").replaceAll("values-", "");
  }

}

export class InvalidDeployYaml extends Error {
  constructor(full_path: string) {
    super(`${full_path} is not a valid deploy yaml`);
  }
}
