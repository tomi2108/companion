import { ExecutionContext } from "@lib/ctx";
import { Workflow } from "@workflow/workflow";

import { WorkflowStep } from "..";
import { CreateMr } from "./CreateMr";
import { MergeMr } from "./MergeMr";
import { Sleep } from "../flow/Sleep";
import { Spinner } from "../ui/Spinner";

type Reads = {};

export class CreateAndMergeMr extends WorkflowStep<Reads> {

  async run(ctx: ExecutionContext, reads: Reads) {
    await new Workflow([
      new CreateMr(),
      new Spinner({ message: "Waiting for mr to be ready", step: new Sleep({ seconds: 60 }) }),
      new MergeMr()
    ]).run(ctx, reads);
    return {};
  }
}
