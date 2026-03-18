import { InvalidJsonFile } from "@files/errors";

import { FileFormatter } from ".";

export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = {
  [key: string]: JsonNode;
};

export type JsonArray = JsonNode[];

export type JsonNode =
  | JsonObject
  | JsonArray
  | JsonPrimitive;

export type JsonValue = JsonArray | JsonObject;

export class JsonFormatter<T extends JsonValue = JsonValue> extends FileFormatter<T> {

  fromString(content: string): T {
    return JSON.parse(content) as T;
  }

  toString(input: T): string {
    return JSON.stringify(input, null, 2);
  }

  exception(path: string): Error {
    return new InvalidJsonFile(path);
  }
}
