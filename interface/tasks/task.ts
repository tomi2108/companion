import { fromMarkdown } from "mdast-util-from-markdown";
import fs from "node:fs";
import path from "node:path";

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
  id: string;
  project: string;

  title: string;
  description?: string;
  tags: TaskTags;

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
          const [key, rawVal] = text.split(":");
          const value = rawVal?.trim();
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

  getMdFile() {
    const tasks_path = Config.get().paths.tasks;
    if (!tasks_path) throw new ConfigError("paths.tasks");
    return path.join(tasks_path, this.project, this.id, "TASK.md");
  }

  constructor({
    id,
    title,
    tags,
    project,
    description
  }: {
    id?: string;
    description?: string;
    project: string;
    title: string;
    tags: TaskTags;
  }) {
    // TODO: generate proper id
    this.id = id ?? new Date().toISOString();
    this.title = title;
    this.tags = tags;
    this.project = project;
    this.description = description;
  }

  toString() {
    return `[${this.tags.status}] (${this.id}) ${this.title}`;
  }
}
