import { JsonFormatter, JsonValue } from "./formatters/json_formatter";
import { ObjectFile } from "./object_file";

export class JsonFile<T extends JsonValue = JsonValue> extends ObjectFile<T> {
  constructor(path: string) {
    super(path, new JsonFormatter<T>());
  }
}
