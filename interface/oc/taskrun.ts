import { AxiosInstance } from "axios";

type TaskRunResponse = {
  metadata: {
    name: string;
  };
  spec: {
    taskRef?: { name: string };
  };
  status: {
    podName: string;
    steps: { container: string }[];
  };
};

export class TaskRun {
  name: string;
  steps?: string[];
  podName?: string;

  private oc: AxiosInstance;

  static fromTaskRunRsponse(run: TaskRunResponse, oc: AxiosInstance) {
    const tr = new TaskRun(run.metadata.name, oc);
    tr.steps = run.status.steps.map((s) => s.container);
    tr.podName = run.status.podName;
    return tr;
  }

  constructor(name: string, oc: typeof this.oc) {
    this.name = name;
    this.oc = oc;
  }
}
