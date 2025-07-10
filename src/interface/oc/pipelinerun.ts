import { AxiosInstance } from "axios";
import { Choice } from "../../lib/constants";
import { Pod } from "./pod";
import chalk from "chalk";

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
    childReferences: TaskRun[];
  };
};

type TaskRun = {
  kind: "TaskRun";
  name: string;
  pipelineTaskName: string;
};

export class PipelineRun {
  name: string;
  namespace?: string;
  reason?: string;
  status?: string;
  taskruns?: TaskRun[];

  private oc: AxiosInstance;

  static fromPipelineRunResponse(run: PipelineRunResponse, oc: AxiosInstance) {
    const p = new PipelineRun(run.metadata.name, oc);
    p.status = run.status.conditions?.[0]?.type;
    p.reason = run.status.conditions?.[0]?.reason;
    p.namespace = run.metadata.namespace;
    p.taskruns = run.status.childReferences;
    return p;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  async followLogs() {
    if (!this.taskruns) throw new Error(`No task runs for PipelineRun ${this.name}`);
    const colors = [
      chalk.blue,
      chalk.red,
      chalk.yellow,
      chalk.magenta,
      chalk.green,
      chalk.cyan
    ];

    for (let i = 0; i < this.taskruns.length; i++) {
      const tr = this.taskruns[i] as TaskRun;
      const { data } = await this.oc.get(`/apis/tekton.dev/v1/namespaces/${this.namespace}/taskruns/${tr.name}`);
      const podName = data.status.podName;
      const steps = data.status.steps.map((s: { container: string }) => s.container);
      const pod = new Pod(podName, this.oc);
      pod.namespace = this.namespace;
      const color = colors[i % colors.length];
      for (const step of steps) {
        await pod.followLogs({ raw: true, prefix: color?.(tr.pipelineTaskName), container: step });
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
