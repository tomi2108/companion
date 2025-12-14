import { File } from "./file";

type DeepObjectPartial<T> = T extends object ? T extends readonly any[] ? never : { [K in keyof T]?: DeepObjectPartial<T[K]> | T[K] } : never;

export abstract class ObjectFile<T extends object = object> extends File<T> {

  writePartial() {
  }

}
