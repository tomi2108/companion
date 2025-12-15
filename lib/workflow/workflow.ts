import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "./steps";

type ValidChain<Steps extends readonly WorkflowStep<any, any>[]> =
  Steps extends readonly [
    infer First,
    infer Second,
    ...infer Rest
  ]
    ? First extends WorkflowStep<any, infer Out1>
      ? Second extends WorkflowStep<infer In2, any>
        ? Out1 extends In2
          ? readonly [
            First,
            ...ValidChain<
              readonly [Second, ...(Rest extends WorkflowStep<any, any>[] ? Rest : [])]
            >
          ]
          : never
        : never
      : never
    : Steps;

type InputOf<S> = S extends WorkflowStep<infer I, any> ? I : never;
type OutputOf<S> = S extends WorkflowStep<any, infer O> ? O : never;
type First<T extends readonly any[]> = T extends readonly [infer F, ...any[]] ? F : never;
type Last<T extends readonly any[]> = T extends readonly [...any[], infer L] ? L : never;

export class Workflow<Steps extends readonly WorkflowStep<any, any>[]> {
  private steps: ValidChain<Steps>;

  constructor(steps: ValidChain<Steps>) {
    this.steps = steps;
  }

  async run(
    ctx: ExecutionContext,
    initialInput: InputOf<First<Steps>>
  ): Promise<OutputOf<Last<Steps>>> {
    let acc = initialInput;

    for (const step of this.steps) {
      acc = await step.run(ctx, acc);
    }

    return acc as OutputOf<Last<Steps>>;
  }
}
