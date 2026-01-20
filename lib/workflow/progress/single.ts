import { ProgressBar, UI } from "@lib/ui";

import { ProgressController, ProgressScope } from "./types";

export class SingleProgressController implements ProgressController {

  constructor(private ui: UI) { }

  root(label = "", total = 0): ProgressScope {
    const bar = this.ui.progressBar(total, label);
    return new SingleProgressScope(bar);
  }

}

class SingleProgressScope implements ProgressScope {
  constructor(private bar: ProgressBar) { }

  child(label?: string, total?: number): ProgressScope {
    if (label) this.bar.setPrefix(label);
    if (typeof total === "number") this.bar.addToTotal(total);
    return this;
  }

  increment(n = 1, label?: string) {
    if (label) this.bar.setSuffix(label);
    this.bar.increment(n);
  }

  close() {
    this.bar.stop();
  }
}
