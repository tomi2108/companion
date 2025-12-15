import { Dir } from "@files/dir";
import { TextFile } from "@files/text_file";
import { openInEditor } from "@lib/editor";

type FileLocation = {
  file: TextFile;
  row: number;
  col: number;
};

export class Task {
  project: Dir;

  title: string;
  description?: string;
  file_location: FileLocation;

  constructor({ title, file_location, project, description }: {
    description?: string;
    project: Dir;
    title: string;
    file_location: FileLocation;
  }) {
    const file = file_location.file;
    if (!project.contains(file)) throw new Error(`${file} is not in ${project}`);
    this.title = title;
    this.file_location = file_location;
    this.project = project;
    this.description = description;
  }

  getTodo() {
    const { file, row } = this.file_location;
    const lines = file.read().split(/\r?\n/);
    const normalized_row = row - 1;
    return lines[normalized_row]!;
  }

  editTodo(add: string) {
    const todoLine = this.getTodo();
    const { file, col, row } = this.file_location;
    const normalized_row = row - 1;
    const normalized_col = col - 1;

    const prefix = todoLine.slice(0, normalized_col);
    const afterTodo = todoLine.slice(normalized_col);
    const colonIndex = afterTodo.indexOf(":");

    const originalDecorations = colonIndex === -1
      ? afterTodo.slice("TODO".length)
      : afterTodo.slice("TODO".length, colonIndex);

    const originalBody = colonIndex === -1 ? "" : afterTodo.slice(colonIndex + 1).trim();

    const newTodo = prefix + "TODO" + originalDecorations + add + ": " + originalBody;
    const lines = file.read().split(/\r?\n/);
    lines[normalized_row] = newTodo;
    file.write(lines.join("\n"));
  }

  openInEditor() {
    const { col, row } = this.file_location;
    openInEditor(this.file_location.file, { line: row, column: col });
  }

  getPathInProject() {
    return this.project.relativePathTo(this.file_location.file) as string;
  }
}
