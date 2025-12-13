import { File } from "./file";

export class TextFile extends File<string> {

  read() {
    return super.readString();
  }

  write(content: string) {
    return super.writeString(content);
  }
}
