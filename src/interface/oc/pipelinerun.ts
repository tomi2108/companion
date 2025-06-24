import { AxiosInstance } from "axios";
import { Choice } from "../../lib/constants";
import { Pod } from "./pod";

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
    p.status = run.status.conditions[0].type;
    p.reason = run.status.conditions[0].reason;
    p.namespace = run.metadata.namespace;
    p.taskruns = run.status.childReferences;
    return p;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  async followLogs() {
    return await Promise.all(
      this.taskruns?.map(async (tr) => {
        const { data } = await this.oc.get(`/apis/tekton.dev/v1/namespaces/${this.namespace}/taskruns/${tr.name}`);
        const podName = data.status.podName;
        const pod = new Pod(podName, this.oc);
        pod.namespace = this.namespace;
        pod.followLogs({ raw: true, prefix: tr.pipelineTaskName });
      }) ?? []);
  }

  toChoice(): Choice {
    return { name: this.name, hint: `(${this.reason ?? "Unknown reason"})` };
  }
}
