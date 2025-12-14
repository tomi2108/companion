import { Task } from "../task";

export abstract class TaskTracker {

  abstract save(task: Task): Promise<string>;
  abstract addIdToTodo(id: string, task: Task): string;
  abstract isTracked(task: Task): boolean;

  async track(task: Task) {
    if (this.isTracked(task)) return;
    const id = await this.save(task);
    task.editTodo(this.addIdToTodo(id, task) ?? "");
  }
}
