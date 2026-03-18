import { AxiosInstance } from "axios";
import chalk from "chalk";
import { setTimeout } from "node:timers/promises";

import { Choice } from "@lib/constants";
import { Pod } from "@oc/pod";
import { TaskRun } from "@oc/taskrun";

export type PipelineRunResponse = {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels: Record<string, string>;
  };
  status: {
    conditions: {
      type: string;
      reason: PipelineStatus;
    }[];
    childReferences: {
      name: string;
      pipelineTaskName: string;
    }[];
  };
};

export const PIPELINE_STATUS = {
  succeeded: "Succeeded",
  failed: "Failed",
  running: "Running"
} as const;

export type PipelineStatus = typeof PIPELINE_STATUS[keyof typeof PIPELINE_STATUS];

export class PipelineRun {
  name: string;
  namespace?: string;
  app?: string;
  reason?: string;
  created?: Date;
  children?: {
    name: string;
    pipelineTaskName: string;
  }[];

  private oc: AxiosInstance;

  static fromPipelineRunResponse(run: PipelineRunResponse, oc: AxiosInstance) {
    const p = new PipelineRun(run.metadata.name, oc);
    p.created = new Date(run.metadata.creationTimestamp);
    p.reason = run.status.conditions?.[0]?.reason;
    p.namespace = run.metadata.namespace;
    p.children = run.status.childReferences;
    p.app = run.metadata.labels.app ?? run.metadata.labels["app.kubernetes.io/name"];
    return p;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  async getTaskRuns() {
    if (!this.children) return [];
    return await Promise.all(
      this.children.map(async ({ name }) =>
        TaskRun.fromTaskRunRsponse(
          (await this.oc.get(`/apis/tekton.dev/v1/namespaces/${this.namespace}/taskruns/${name}`)).data,
          this.oc
        )
      )
    );
  }

  async followLogs() {
    const trs = await this.getTaskRuns();
    if (trs.length === 0) return;
    const colors = [
      chalk.blue,
      chalk.red,
      chalk.yellow,
      chalk.magenta,
      chalk.green,
      chalk.cyan
    ];

    for (let i = 0; i < trs.length; i++) {
      const tr = trs[i];
      const prefix = this.children?.[i]?.pipelineTaskName ?? "";
      if (!tr?.podName || !tr.steps) continue;
      const pod = new Pod(tr.podName, this.oc);
      pod.namespace = this.namespace;
      const color = colors[i % colors.length];
      for (const step of tr.steps) {
        await pod.followLogs({
          raw: true,
          prefix: color?.(prefix),
          container: step
        });
        setTimeout(15 * 1000); // give some time for next pod to start
      }
    }
  }

  async status(): Promise<PipelineStatus> {
    const data: PipelineRunResponse = (await this.oc.get(`/apis/tekton.dev/v1/namespaces/${this.namespace}/pipelineruns/${this.name}`)).data;
    return data.status.conditions?.[0]?.reason ?? PIPELINE_STATUS.failed;
  }

  toString() {
    return this.name;
  }

  toChoice(): Choice {
    return { name: this.toString(), hint: `(${this.reason ?? "Unknown reason"})` };
  }
}
