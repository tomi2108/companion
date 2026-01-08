import { WorkflowStep } from "../..";

export type ForEachWrites<
  InnerWrites,
  Key extends string | undefined
> = Key extends string ? InnerWrites extends void ? never : { [K in Key]: InnerWrites[] } : {};

export type ForEachOptions<
  Key,
  Reads,
  Options,
  Item,
  InnerReads,
  InnerWrites,
  InnerOptions
> =
  | Options & {
    items: (state: Reads) => Item[];
    step: WorkflowStep<InnerReads, InnerWrites, InnerOptions>;
    collectAs?: undefined;
  }
  | (InnerWrites extends void
    ? never
    : Options & {
      items: (state: Reads) => Item[];
      step: WorkflowStep<InnerReads, InnerWrites, InnerOptions>;
      collectAs: Key;
    });
