import { InvalidJsonFile } from "./errors";
import { File } from "./file";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | { [key: string]: JsonValue }
  | JsonValue[];

export class JsonFile<T extends JsonValue = JsonValue> extends File<T> {

  read(): T {
    const content = super.readString();
    try {
      return JSON.parse(content) as T;
    } catch {
      throw new InvalidJsonFile(this.path);
    }
  }

  write(content: T) {
    const string = JSON.stringify(content, null, 2);
    super.writeString(string);
  }
}
