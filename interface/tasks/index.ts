import fs from "node:fs";

import { Task } from "@interface/tasks/task";
import { sleep } from "@lib/utils";

export function getTasksFromFile(file_path: string) {
  const content = fs.readFileSync(file_path).toString();
  const lines = content.split(/\r?\n/);
  const results: Task[] = [];

  lines.forEach((line, row) => {
    const regex = /TODO:\s*(.*)/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const col = match.index;
      const title = match[1]?.trim() ?? "";
      const file_location = { file_path: "", row, col };
      const project = "";
      results.push(new Task({
        id: "",
        title,
        project,
        tags: {
          priority: 1,
          status: "OPEN",
          file_location
        }
      }));
      sleep(1 * 1000);
    }
  });
}

