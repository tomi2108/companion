import { AxiosInstance } from "axios";

import { Pod, PodResponse } from "@oc/pod";

export type CronJobResponse = {
  metadata: {
    name: string;
    namespace: string;
  };
};

type Job = {
  metadata: {
    name: string;
    ownerReferences?: { kind: string; name: string }[];
    creationTimestamp?: string;
  };
  status?: {
    startTime?: string;
  };
};

export class CronJob {
  name: string;
  namespace: string;
  private oc: AxiosInstance;

  constructor(name: string, namespace: string, oc: AxiosInstance) {
    this.name = name;
    this.namespace = namespace;
    this.oc = oc;
  }

  static fromCronJobResponse(apiObj: CronJobResponse, oc: AxiosInstance): CronJob {
    return new CronJob(apiObj.metadata.name, apiObj.metadata.namespace, oc);
  }

  async getJobs(): Promise<Job[]> {
    const resp = await this.oc.get<{ items: Job[] }>(
      `/apis/batch/v1/namespaces/${this.namespace}/jobs`, { params: { limit: 250 } }
    );
    const items = resp.data.items ?? [];
    return items.filter(
      (job) =>
        Array.isArray(job.metadata.ownerReferences)
        && job.metadata.ownerReferences.some(
          (ref) => ref.kind === "CronJob" && ref.name === this.name
        )
    );
  }

  async getLatestJob(): Promise<Job | undefined> {
    const jobs = await this.getJobs();
    jobs.sort(
      (a, b) =>
        new Date(b.status?.startTime || 0).getTime() - new Date(a.status?.startTime || 0).getTime()
    );
    return jobs[0];
  }

  async getPodsForJob(jobName: string): Promise<PodResponse[]> {
    const resp = await this.oc.get<{ items: PodResponse[] }>(
      `/api/v1/namespaces/${this.namespace}/pods`,
      { params: { labelSelector: `job-name=${jobName}` } }
    );
    return resp.data.items ?? [];
  }

  async getLatestPodForJob(jobName: string): Promise<Pod | null> {
    const pods = await this.getPodsForJob(jobName);
    pods.sort(
      (a, b) =>
        new Date(b.status.startTime).getTime() - new Date(a.status.startTime).getTime()
    );
    const lastPodResp = pods[0];
    if (!lastPodResp) return null;
    return Pod.fromPodResponse(lastPodResp, this.oc);
  }

  async getLastLog(): Promise<string | null> {
    const latest = await this.getLatestJob();
    if (!latest) return null;
    const lastPod = await this.getLatestPodForJob(latest.metadata.name);
    if (!lastPod) return null;
    const logs = await lastPod.getLogs();
    return logs;
  }

  toChoice() {
    return { name: this.name };
  }
}
