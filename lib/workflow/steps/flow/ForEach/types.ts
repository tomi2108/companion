export type ForEachWrites<
  InnerWrites,
  Key extends string | undefined
> = Key extends string ? InnerWrites extends void ? never : { [K in Key]: InnerWrites[] } : {};

export type ForEachOptions<
  Key,
  Options,
  InnerWrites
> =
  | Options & { collectAs?: undefined }
  | (InnerWrites extends void
    ? never
    : Options & { collectAs: Key });
