export abstract class FileFormatter<T> {
  abstract toString(input: T): string;
  abstract fromString(content: string): T;
  abstract exception(path: string): Error | void;
  tryFromString(content: string): T | null {
    try {
      return this.fromString(content);
    } catch {
      return null;
    }
  }
}
