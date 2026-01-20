import { MultiProgressBar, ProgressBar, UI } from "@lib/ui";

import { ProgressController, ProgressScope } from "./types";

export class MultiProgressController implements ProgressController {

  constructor(
    private ui: UI,
    private multibar?: MultiProgressBar
  ) { }

  root(): ProgressScope {
    const multibar = this.multibar ?? this.ui.multiProgressBar();
    return new MultiProgressScope(multibar);
  }

}

class MultiProgressScope implements ProgressScope {
  constructor(
    private multibar: MultiProgressBar,
    private bar?: ProgressBar
  ) { }

  child(label = "", total = 0): ProgressScope {
    const childBar = this.multibar.create(total, label);
    return new MultiProgressScope(this.multibar, childBar);
  }

  increment(n = 1, label?: string) {
    if (label) this.bar?.setSuffix(label);
    this.bar?.increment(n);
  }

  close() {
    this.bar?.stop();
  }
}
