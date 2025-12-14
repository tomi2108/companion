export interface FileFormatter<T> {
  toString(input: T): string;
  fromString(content: string): T;
  exception(path: string): Error | void;
}
