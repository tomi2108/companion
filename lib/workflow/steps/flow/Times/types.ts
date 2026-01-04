
import { WorkflowStep } from "../..";

export type TimesWrites<
  InnerWrites,
  Keys extends string[] | undefined
> = Keys extends string[] ? InnerWrites extends void ? never : { [K in Keys[number]]: InnerWrites } : {};

type CommonOptions<Options> = Options;

export type TimesOptions<
  Options,
  Keys,
  InnerReads,
  InnerWrites,
  InnerOptions
> =
  | CommonOptions<Options> & {
    step: WorkflowStep<InnerReads, InnerWrites, InnerOptions>;
    collectAs?: undefined;
  }
  | (InnerWrites extends void
    ? never
    : CommonOptions<Options> & {
      step: WorkflowStep<InnerReads, InnerWrites, InnerOptions>;
      collectAs: Keys;
    });
