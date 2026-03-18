import { File } from "./file";

type DeepObjectPartial<T> = T extends object ? T extends readonly any[] ? never : { [K in keyof T]?: DeepObjectPartial<T[K]> | T[K] } : never;

function deepMergeObject<T extends object>(
  target: T,
  patch: DeepObjectPartial<T>
): T {
  const result: any = { ...target };

  for (const key in patch) {
    const patchValue = patch[key];
    const targetValue = (target as any)[key];

    if (
      patchValue
      && typeof patchValue === "object"
      && !Array.isArray(patchValue)
      && targetValue
      && typeof targetValue === "object"
      && !Array.isArray(targetValue)
    ) {
      result[key] = deepMergeObject(targetValue, patchValue as any);
    } else {
      result[key] = patchValue;
    }
  }

  return result;
}

export abstract class ObjectFile<T extends object = object> extends File<T> {

  writePartial(partial: DeepObjectPartial<T>) {
    const current = this.read();
    const updated = deepMergeObject(current, partial);
    this.write(updated);
  }
}
