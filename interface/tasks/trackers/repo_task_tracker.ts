
import { Repo } from "@interface/dirs/repo";
import { Task } from "@interface/tasks/task";
import { sleep } from "@lib/utils";

import { TaskTracker } from "./task_tracker";

export const TASK_FILE = "TASK.md";

// TODO: for now Tasks change status manually outside the app,
// add support for trackers to change task status, could be useful for RepoActions
const TASK_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED"
} as const;

export class RepoTaskTracker extends TaskTracker {
  repo: Repo;

  constructor(repo: Repo) {
    super();
    this.repo = repo;
  }

  override addIdToTodo(id: string): string {
    return `(${id})`;
  }

  override async save(task: Task): Promise<string> {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const HH = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const SS = pad(d.getSeconds());
    await sleep(1 * 1000);
    const id = `${YYYY}${MM}${DD}-${HH}${mm}${SS}`;

    const tasks_dir = this.repo.dir.sub("tasks");
    tasks_dir.create();
    const task_dir = tasks_dir.sub(id);
    task_dir.createFile(TASK_FILE).write(this.toMdString(task));
    return id;
  }

  override isTracked(task: Task): boolean {
    const todoLine = task.getTodo();
    const regex = /TODO[^:]*\([^)]*\)[^:]*:/;
    return regex.test(todoLine);
  }

  private toMdString(task: Task) {
    const relative = task.getPathInProject();
    return `# ${task.title}

  - PROJECT: ${task.project}
  - FILE-LOCATION: ${relative}:${task.file_location.row}:${task.file_location.col}
  - STATUS: ${TASK_STATUS.OPEN}

${task.description} `;
  }

  // async getTasks(project?: string) {
  //   await this.update();
  //   const dirs = project ? [project] : readdirs(this.full_path).map((d) => d.name);
  //   const full_dirs = dirs.map((d) => path.join(this.full_path, d));
  //   return full_dirs.flatMap((d) => readdirs(d).map((task_dir) => Task.fromTaskFile(path.join(d, task_dir.name, TASK_FILE))));
  // }
  //
  // addTask(task: Task) {
  //   const dir = path.join(this.full_path, task.project, task.id);
  //   const task_path = path.join(dir, TASK_FILE);
  //   createDirIfNotExists(dir);
  //   task.save(task_path);
  // }

  // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/dux/-/issues/37]: move to TaskRepo
  // private static parseFileLocation(raw: string): FileLocation {
  //   const [file_path, row, col] = raw.split(":");
  //   if (!file_path) throw new Error(`Could not parse file location ${raw} file_path missing`);
  //   return { file_path, row: Number(row), col: Number(col) };
  // }

  // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/dux/-/issues/63]: move to TaskRepo
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
}
