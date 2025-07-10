import { AxiosInstance } from "axios";
import { Choice } from "../../lib/constants";
import { Pod } from "./pod";
import chalk from "chalk";
import { TaskRun } from "./taskrun";

export type PipelineRunResponse = {
  metadata: {
    name: string;
    namespace: string;
  };
  status: {
    conditions: {
      type: string;
      reason: string;
    }[];
    childReferences: {
      name: string;
      pipelineTaskName: string;
    }[];
  };
};

export class PipelineRun {
  name: string;
  namespace?: string;
  reason?: string;
  status?: string;
  children?: {
    name: string;
    pipelineTaskName: string;
  }[];

  private oc: AxiosInstance;

  static fromPipelineRunResponse(run: PipelineRunResponse, oc: AxiosInstance) {
    const p = new PipelineRun(run.metadata.name, oc);
    p.status = run.status.conditions?.[0]?.type;
    p.reason = run.status.conditions?.[0]?.reason;
    p.namespace = run.metadata.namespace;
    p.children = run.status.childReferences;
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
          raw: true, prefix: color?.(prefix),
          container: step
        });
      }
    }
  }

  // async followLogs() {
  //   return await Promise.all(
  //     this.taskruns?.map(async (tr) => {
  //       const { data } = await this.oc.get(`/apis/tekton.dev/v1/namespaces/${this.namespace}/taskruns/${tr.name}`);
  //       const podName = data.status.podName;
  //       const pod = new Pod(podName, this.oc);
  //       pod.namespace = this.namespace;
  //       pod.followLogs({ raw: true, prefix: tr.pipelineTaskName });
  //     }) ?? []);
  // }

  toChoice(): Choice {
    return { name: this.name, hint: `(${this.reason ?? "Unknown reason"})` };
  }
}
