import { MultiBar, multiProgressBar, ProgressBar } from "@lib/ui";

import { ProgressController, ProgressScope } from "./types";

export class MultiProgressController implements ProgressController {
  constructor(private multibar = multiProgressBar()) { }

  root(): ProgressScope {
    return new MultiProgressScope(
      this.multibar
    );
  }

}

class MultiProgressScope implements ProgressScope {
  constructor(
    private multibar: MultiBar,
    private bar?: ProgressBar
  ) { }

  child(label = "", total = 0): ProgressScope {
    const childBar = this.multibar.create(total, label);
    return new MultiProgressScope(this.multibar, childBar);
  }

  increment(n = 1, label?: string) {
    if (label) this.bar?.setSufix(label);
    this.bar?.increment(n);
  }

  close() {
    this.bar?.stop();
  }
}
