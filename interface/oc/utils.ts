import { setTimeout } from "node:timers/promises";

import { AppRepo } from "@files/app_repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { loading } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { PipelineRun, PipelineStatus } from "@oc/pipelinerun";
import { Project } from "@oc/project";

export async function waitForPipeline(pipeline: PipelineRun, loadingText?: string) {
  const spinner = loading(loadingText ?? "Running pipeline");
  while (await pipeline.status() === PipelineStatus.running) setTimeout(15 * 1000);
  const status = await pipeline.status();
  if (status === PipelineStatus.succeeded) spinner.succeed("Pipeline succeeded");
  else spinner.fail("Pipeline failed");
  return status;
}

export async function findCIPipeline(app_repo: AppRepo) {
  const token = await getOcToken("brc");
  const projects = await new Openshift(token, "brc").getProjects();
  const ci_paas = projects.find((p) => p.name === "ci-paas");
  if (!ci_paas) {
    log.warning("Could not find ci-paas project");
    return null;
  }
  return await app_repo.findPipeline(ci_paas, "ci");
}

export async function findSyncPipeline(app_repo: AppRepo) {
  const token = await getOcToken("brc");
  const projects = await new Openshift(token, "brc").getProjects();
  const cd_paas = projects.find((p) => p.name === "cd-paas");
  if (!cd_paas) {
    log.warning("Could not find cd-paas project");
    return null;
  }
  return await app_repo.findPipeline(cd_paas, "sync");
}

export async function findArgoPipeline(app_repo: AppRepo, project: Project) {
  const token = await getOcToken("brc");
  const projects = await new Openshift(token, "brc").getProjects();
  const cd_paas = projects.find((p) => p.name === "cd-paas");
  if (!cd_paas) {
    log.warning("Could not find cd-paas project");
    return null;
  }
  return await app_repo.findPipeline(cd_paas, project.name);
}

export function toExternalEnv(str: string) {
  const config = Config.get().openshift;
  return str
    .replace(new RegExp(`.${config.namespace_prefix}`, "g"), `-${config.namespace_prefix}`)
    .replace(/\.svc\.cluster\.local:8080/g, `.apps.${config.server_name}.cuyorh.tcloud.ar`);
}

export function toInternalEnv(str: string) {
  const config = Config.get().openshift;
  return str
    .replaceAll(new RegExp(`-${config.namespace_prefix}`, "g"), `.${config.namespace_prefix}`)
    .replaceAll(/\.apps\..*\.cuyorh\.tcloud\.ar/g, ".svc.cluster.local:8080");
}
