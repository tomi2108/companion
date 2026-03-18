import { Event } from "./events";
// import { EventLogger } from "./log_events";

type Handler<E extends Event> = (event: E) => void | Promise<void>;

export class ActionRegistry {

  private static actions = new Map<
    Function,
    Handler<any>[]
  >();

  static on<E extends Event>(
    event: new (...args: any[]) => E,
    handler: Handler<E>
  ) {
    const list = this.actions.get(event) ?? [];
    list.push(handler);
    this.actions.set(event, list);
  }

  static async dispatch<E extends Event>(event: E) {
    const handlers = this.actions.get(event.constructor) ?? [];
    // new EventLogger().log(event);
    for (const handler of handlers) {
      await handler(event);
    }
  }
}
