import { ExecutionContext } from "@lib/ctx";

export interface WorkflowStep<I, O> {
  run(ctx: ExecutionContext, input: I): Promise<O>;
}

export interface TapStep<I> extends WorkflowStep<I, I> {
}
