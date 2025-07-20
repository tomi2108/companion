import { setTimeout } from "node:timers/promises";

import { AppRepo } from "@files/app_repo";
import log from "@lib/log";
import { loading } from "@lib/ui";
import { Openshift } from "@oc";

import { getOcToken } from "./api";
import { PipelineRun, PipelineStatus } from "./pipelinerun";
import { Project } from "./project";

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

