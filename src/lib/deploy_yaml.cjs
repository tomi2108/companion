const { ENVS } = require("./constants.cjs");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
const { getDeploymentOption } = require("../interface/files.cjs");
const config = require("../lib/config.cjs");

class InvalidDeployYaml extends Error {
  constructor(full_path) {
    super(`${full_path} is not a valid deploy yaml`);
  }
}

class DeployYaml {
  static isDeployYamlFile(file) {
    return file.isFile()
      && ENVS.some((e) => file.name.includes(e))
      && file.name.includes("values-");
    // TODO: probably look for "helm-chart"
    // && fs.readFileSync(file.);
  }

  constructor(file_path) {
    const file_content = fs.readFileSync(file_path);
    const yaml_content = yaml.load(file_content)?.["helm-chart-master"];
    if (!yaml_content) throw new InvalidDeployYaml(file_path);

    this.content = yaml_content;
    this.file_path = file_path;
    this.env = ENVS.find((e) => path.basename(file_path).includes(e));
  }

  prepareDeploy(type) {
    // TODO: add elasticsearch automatically as last secret
    this.content.dynatrace.modulo = config.dynatrace?.modulo ?? this.content.dynatrace.modulo ?? "NO_INFORMADO";
    this.content.dynatrace.tipo = type === "app" ? "MICROFRONTEND" : type.toUpperCase();
    this.content.dynatrace.clave_jira = config.jira?.project_key ?? this.content.dynatrace.clave_jira ?? "NO_INFORMADO";
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

    this.content.labels.lproduct = config.openshift.product ?? this.content.labels.lproduct;
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

  isEnv(env) {
    return this.env === env;
  }

  setVersion(version) {
    this.content.image.tag = version;
  }

  getVersion() {
    return this.content.image.tag;
  }

}

module.exports = { DeployYaml, InvalidDeployYaml };
