import { progressBar, ProgressBar } from "@lib/ui";

import { ProgressController, ProgressScope } from "./types";

export class SingleProgressController implements ProgressController {
  root(label = "", total = 0): ProgressScope {
    return new SingleProgressScope(progressBar(total, label));
  }
}

class SingleProgressScope implements ProgressScope {
  constructor(private bar: ProgressBar) { }

  child(label?: string, total?: number): ProgressScope {
    if (label) this.bar.setPrefix(label);
    if (typeof total === "number") this.bar.setTotal(total);
    return this;
  }

  increment(n = 1, label?: string) {
    if (label) this.bar.setSufix(label);
    this.bar.increment(n);
  }

  close() {
    this.bar.stop();
  }
}
