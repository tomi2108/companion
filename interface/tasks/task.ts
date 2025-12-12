import fs from "node:fs";

// TODO: move to TaskRepo
// const TASK_STATUS = {
//   OPEN: "OPEN",
//   CLOSED: "CLOSED"
// } as const;

type FileLocation = { file_path: string; row: number; col: number };

export class Task {
  project: string;

  title: string;
  description?: string;
  file_location: FileLocation;

  constructor({ title, file_location, project, description }: {
    description?: string;
    project: string;
    title: string;
    file_location: FileLocation;
  }) {
    this.title = title;
    this.file_location = file_location;
    this.project = project;
    this.description = description;
  }

  private getFileLines() {
    const { file_path } = this.file_location;
    const content = fs.readFileSync(file_path).toString();
    const lines = content.split(/\r?\n/);
    return lines;
  }

  getTodo() {
    const { row } = this.file_location;
    const normalized_row = row - 1;
    const lines = this.getFileLines();
    return lines[normalized_row]!;
  }

  editTodo(add: string) {
    const todoLine = this.getTodo();
    const { file_path, col, row } = this.file_location;
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
    const lines = this.getFileLines();
    lines[normalized_row] = newTodo;
    fs.writeFileSync(file_path, lines.join("\n"));
  }

  // TODO: move to TaskRepo
  // private static parseFileLocation(raw: string): FileLocation {
  //   const [file_path, row, col] = raw.split(":");
  //   if (!file_path) throw new Error(`Could not parse file location ${raw} file_path missing`);
  //   return { file_path, row: Number(row), col: Number(col) };
  // }

  // TODO: move to TaskRepo
  // static fromTaskFile(file: string) {
  //   const raw = fs.readFileSync(file, "utf8");
  //
  //   const tree = fromMarkdown(raw);
  //
  //   let title: string | undefined;
  //   let id: string | undefined;
  //   let project: string | undefined;
  //   let status: TaskStatus | undefined;
  //   let priority: number | undefined;
  //   let fileLocation: FileLocation | undefined;
  //   let jiraId: string | undefined;
  //   let description = "";
  //
  //   for (const node of tree.children) {
  //     if (node.type === "heading" && node.depth === 1) {
  //       if (!node.children[0] || !("value" in node.children[0])) continue;
  //       title = node.children[0]?.value.trim();
  //       continue;
  //     }
  //
  //     if (node.type === "list") {
  //       for (const item of node.children) {
  //         if (!item.children[0]
  //           || !("children" in item.children[0])
  //           || !item.children[0].children[0]
  //           || !("value" in item.children[0].children[0])) continue;
  //         const text = item.children[0].children[0]?.value;
  //         const [key, rawVal, ...rest] = text.split(":");
  //         const value = [rawVal, ...rest].join(":")?.trim();
  //         switch (key) {
  //           case "ID":
  //             id = value;
  //             break;
  //           case "PROJECT":
  //             project = value;
  //             break;
  //           case "STATUS": {
  //             const statuses = Object.values(TASK_STATUS);
  //             if (!statuses.includes(value as TaskStatus)) throw new Error(`Invalid STATUS "${value}". Must be one of: ${statuses.join(", ")}`);
  //             status = value as TaskStatus;
  //             break;
  //           }
  //           case "PRIORITY":
  //             priority = Number(value);
  //             break;
  //           case "JIRA-ID":
  //             jiraId = value;
  //             break;
  //           case "FILE-LOCATION":
  //             fileLocation = this.parseFileLocation(value ?? "");
  //             break;
  //         }
  //       }
  //       continue;
  //     }
  //
  //     if (node.type === "paragraph") {
  //       const text = node.children.map((c) => {
  //         if (!("value" in c)) return "";
  //         return c.value;
  //       }).join("").trim();
  //       if (text) description += (description ? "\n" : "") + text;
  //     }
  //   }
  //
  //   if (!id) throw new Error(`Could not find id for task ${file}`);
  //   if (!project) throw new Error(`Could not find project for task ${file}`);
  //   if (!title) throw new Error(`Could not find title for task ${id} from project ${project}`);
  //   if (!priority) throw new Error(`Could not find priority for task ${id} from project ${project}`);
  //   if (!status) throw new Error(`Could not find status for task ${id} from project ${project}`);
  //
  //   return new Task({
  //     md_path: file,
  //     id,
  //     title,
  //     project,
  //     description,
  //     tags: {
  //       status,
  //       priority,
  //       jira_id: jiraId,
  //       file_location: fileLocation
  //     }
  //   });
  // }

  openInEditor() {
    // TODO: implement Task.openInEditor()
  }

  // TODO: probably TaskRepo should be a TaskTracker and use this method for .generateId()
  //
  // static newId() {
  //   const d = new Date();
  //   const pad = (n: number) => String(n).padStart(2, "0");
  //   const YYYY = d.getFullYear();
  //   const MM = pad(d.getMonth() + 1);
  //   const DD = pad(d.getDate());
  //   const HH = pad(d.getHours());
  //   const mm = pad(d.getMinutes());
  //   const SS = pad(d.getSeconds());
  //   return `${YYYY}${MM}${DD}-${HH}${mm}${SS}`;
  // }
  // TODO: probably TaskRepo should be a TaskTracker and use this method for .save()
  //   toMdString() {
  //     const required_tags = `- ID: ${this.id}
  // - PROJECT: ${this.project}
  // - STATUS: ${this.tags.status}
  // - PRIORITY: ${this.tags.priority}`;
  //     const tags = [
  //       required_tags,
  //       this.tags.file_location && `- FILE-LOCATION: ${this.tags.file_location.file_path}:${this.tags.file_location.row}:${this.tags.file_location.col}`
  //     ].filter(Boolean).join("\n");
  //     return `# ${this.title}
  //
  // ${tags}
  //
  // ${this.description ?? ""}`;
  //   }
}
