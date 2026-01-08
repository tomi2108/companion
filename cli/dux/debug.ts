import { ExecutionContext } from "@lib/ctx";
import { Debug } from "@steps/Debug";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { Input } from "@steps/ui/Input";
import { Workflow } from "@workflow/workflow";

export default {
  command: "debug",
  describe: "Testing purposes",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const pipe = new ForEach({
      item: "",
      items: () => [1, 2, 3, 4],
      step: new Workflow([
        new Debug(),
        new Debug()
      ])
    });
    new Workflow([
      new Input({ message: "haha", write: "aaaa" }),
      new If({
        condition: () => ctx.ui.confirm({ message: "AAAA" }),
        then: pipe,
        else: new Workflow([pipe, new Debug()])
      })
    ]).run(ctx);
  }
};
