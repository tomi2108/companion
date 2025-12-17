import { MultiBar } from "@lib/ui";

import { WorkflowStep } from "..";

export type ForEachWrites<
  InnerWrites,
  Key extends string | undefined
> = Key extends string ? InnerWrites extends void ? never : { [K in Key]: InnerWrites[] } : {};

type CommonOptions<Options> = Options & {
  item: string;
};

export type ForEachOptions<
  Reads,
  Options,
  Item,
  InnerReads,
  InnerWrites,
  InnerOptions
> =
  | CommonOptions<Options> & {
    items: (state: Reads) => Item[];
    step: WorkflowStep<InnerReads, InnerWrites, InnerOptions>;
    collectAs?: undefined;
  }
  | (InnerWrites extends void
    ? never
    : CommonOptions<Options> & {
      items: (state: Reads) => Item[];
      step: WorkflowStep<InnerReads, InnerWrites, InnerOptions>;
      collectAs: string;
    });

export type ForEachReads = {
  multibar?: MultiBar;
};

