import { fromMarkdown } from "mdast-util-from-markdown";
import fs from "node:fs";

import { Jira } from "@jira";
import { Config, ConfigError } from "@lib/config";

const TASK_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED"
} as const;

type FileLocation = { file_path: string; row: number; col: number };
type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
type TaskTags = {
  status: TaskStatus;
  priority: number;
  jira_id?: string;
  file_location?: FileLocation;
};

export class Task {
  md_path?: string;
  id: string;
  project: string;

  title: string;
  description?: string;
  tags: TaskTags;

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

  private static parseFileLocation(raw: string): FileLocation {
    const [file_path, row, col] = raw.split(":");
    if (!file_path) throw new Error(`Could not parse file location ${raw} file_path missing`);
    return { file_path, row: Number(row), col: Number(col) };
  }

  static fromTaskFile(file: string) {
    const raw = fs.readFileSync(file, "utf8");

    const tree = fromMarkdown(raw);

    let title: string | undefined;
    let id: string | undefined;
    let project: string | undefined;
    let status: TaskStatus | undefined;
    let priority: number | undefined;
    let fileLocation: FileLocation | undefined;
    let jiraId: string | undefined;
    let description = "";

    for (const node of tree.children) {
      if (node.type === "heading" && node.depth === 1) {
        if (!node.children[0] || !("value" in node.children[0])) continue;
        title = node.children[0]?.value.trim();
        continue;
      }

      if (node.type === "list") {
        for (const item of node.children) {
          if (!item.children[0]
            || !("children" in item.children[0])
            || !item.children[0].children[0]
            || !("value" in item.children[0].children[0])) continue;
          const text = item.children[0].children[0]?.value;
          const [key, rawVal, ...rest] = text.split(":");
          const value = [rawVal, ...rest].join(":")?.trim();
          switch (key) {
            case "ID":
              id = value;
              break;
            case "PROJECT":
              project = value;
              break;
            case "STATUS": {
              const statuses = Object.values(TASK_STATUS);
              if (!statuses.includes(value as TaskStatus)) throw new Error(`Invalid STATUS "${value}". Must be one of: ${statuses.join(", ")}`);
              status = value as TaskStatus;
              break;
            }
            case "PRIORITY":
              priority = Number(value);
              break;
            case "JIRA-ID":
              jiraId = value;
              break;
            case "FILE-LOCATION":
              fileLocation = this.parseFileLocation(value ?? "");
              break;
          }
        }
        continue;
      }

      if (node.type === "paragraph") {
        const text = node.children.map((c) => {
          if (!("value" in c)) return "";
          return c.value;
        }).join("").trim();
        if (text) description += (description ? "\n" : "") + text;
      }
    }

    if (!id) throw new Error(`Could not find id for task ${file}`);
    if (!project) throw new Error(`Could not find project for task ${file}`);
    if (!title) throw new Error(`Could not find title for task ${id} from project ${project}`);
    if (!priority) throw new Error(`Could not find priority for task ${id} from project ${project}`);
    if (!status) throw new Error(`Could not find status for task ${id} from project ${project}`);

    return new Task({
      md_path: file,
      id,
      title,
      project,
      description,
      tags: {
        status,
        priority,
        jira_id: jiraId,
        file_location: fileLocation
      }
    });
  }

  async generateJiraId() {
    if (
      this.tags.jira_id
      || !this.tags.file_location
    ) return;
    const config = Config.get();
    const jira = new Jira();
    const parent_key = config.tasks.jira_parent_key;
    const labels = config.jira.labels;
    if (!parent_key) throw new ConfigError("tasks.jira_parent_key");
    const parent_issue = await jira.getIssue(parent_key);
    // TODO: arreglar
    const created_issue = await parent_issue.createChild({
      asignee: await jira.getCurrentUser(),
      reporter: await jira.getCurrentUser(),
      project: await jira.getProject(),
      title: `TODO(${this.project}): ${this.title}`,
      description: `- FILE-LOCATION: ${this.tags.file_location.file_path}:${this.tags.file_location.row}:${this.tags.file_location.col}`,
      labels
    });
    const jira_key = created_issue.key;
    const { file_path, row, col } = this.tags.file_location;
    const normalized_col = col - 1;
    const normalized_row = row - 1;

    const content = fs.readFileSync(file_path).toString();
    const lines = content.split(/\r?\n/);
    if (normalized_row < 0 || normalized_row >= lines.length) throw new Error(`Row ${row} is out of range for file ${file_path}`);
    const line = lines[normalized_row]!;
    const prefix = line.slice(0, normalized_col);
    const newTodo = `TODO(${jira_key}): ${this.title}`;
    lines[normalized_row] = prefix + newTodo;
    fs.writeFileSync(file_path, lines.join("\n"));

    this.tags.jira_id = jira_key;
  }

  constructor({
    md_path,
    id,
    title,
    tags,
    project,
    description
  }: {
    md_path?: string;
    id?: string;
    description?: string;
    project: string;
    title: string;
    tags: TaskTags;
  }) {
    this.md_path = md_path;
    // this.id = id ?? Task.newId();
    this.id = id ?? "";
    this.title = title;
    this.tags = tags;
    this.project = project;
    this.description = description;
  }

  save(file: string) {
    fs.writeFileSync(file, this.toMdString());
    this.md_path = file;
  }

  openInEditor() {
  }

  toString() {
    return `[${this.tags.status}] (${this.id}) ${this.title}`;
  }

  toMdString() {
    const required_tags = `- ID: ${this.id}
- PROJECT: ${this.project}
- STATUS: ${this.tags.status}
- PRIORITY: ${this.tags.priority}`;
    const tags = [
      required_tags,
      this.tags.jira_id ? `- JIRA-ID: ${this.tags.jira_id}` : "",
      this.tags.file_location && `- FILE-LOCATION: ${this.tags.file_location.file_path}:${this.tags.file_location.row}:${this.tags.file_location.col}`
    ].filter(Boolean).join("\n");
    return `# ${this.title}

${tags}

${this.description ?? ""}`;
  }
}
