
import { Task } from "./task";

export abstract class TaskTracker {

  abstract generateId(task: Task): Promise<string>;
  abstract addIdToTodo(id: string, task: Task): string;
  abstract isTracked(task: Task): boolean;

  async save(task: Task) {
    if (this.isTracked(task)) return;
    const id = await this.generateId(task);
    task.editTodo(this.addIdToTodo(id, task) ?? "");
  }
}
