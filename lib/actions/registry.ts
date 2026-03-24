import { Event } from "./events";
// import { EventLogger } from "./log_events";

type Handler<E extends Event> = (event: E) => void | Promise<void>;

export class ActionRegistry {

  private static actions = new Map<string, Handler<any>[]>();

  static on<E extends Event>(
    event: new (...args: any[]) => E,
    handler: Handler<E>
  ) {
    const name = (new event).name;
    const list = this.actions.get(name) ?? [];
    list.push(handler);
    this.actions.set(name, list);
  }

  static async dispatch<E extends Event>(event: E) {
    const handlers = this.actions.get(event.name) ?? [];
    // new EventLogger().log(event);
    for (const handler of handlers) {
      await handler(event);
    }
  }
}
