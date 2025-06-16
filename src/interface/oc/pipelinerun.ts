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
    childReferences: { name: string }[];
  };
};

export class PipelineRun {
  name: string;
  namespace?: string;
  reason?: string;
  status?: string;
  taskruns?: string[];

  private oc: AxiosInstance;

  static fromPipelineRunResponse(run: PipelineRunResponse, oc: AxiosInstance) {
    const p = new PipelineRun(run.metadata.name, oc);
    p.status = run.status.conditions[0].type;
    p.reason = run.status.conditions[0].reason;
    p.namespace = run.metadata.namespace;
    p.taskruns = run.status.childReferences.map((t) => t.name);
    return p;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }

  async followLogs() {
    return await Promise.all(
      this.taskruns?.map(async (tr) => {
        const { data } = await this.oc.get(`/apis/tekton.dev/v1/namespaces/${this.namespace}/taskruns/${tr}`);
        const podName = data.status.podName;
        const pod = new Pod(podName, this.oc);
        pod.namespace = this.namespace;
        const name = data.status.taskSpec.steps[0].name;
        pod.followLogs({ raw: true, prefix: name });
      }) ?? []);
  }

  toChoice(): Choice {
    return { name: this.name, hint: `[${this.status ?? "Unknown status"}] (${this.reason ?? "Unknown reason"})` };
  }
}
