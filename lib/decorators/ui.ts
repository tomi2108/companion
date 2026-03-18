import { UI } from "@lib/ui";

let ui: UI | null = null;

export function registerLoadingAdapter(u: UI) {
  ui = u;
}

export function loading<T extends any[] = any[]>(message: string, extra?: (...args: T) => string) {
  return function(_: any, __: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function(...args: T) {
      if (!ui) return original.apply(this, args);

      const final_message = extra ? `${message} ${extra(...args)}` : message;
      const spinner = ui.loading(final_message);
      try {
        const ret = await original.apply(this, args);
        spinner.succeed();
        return ret;
      } catch (err) {
        spinner.fail();
        throw err;
      }
    };
    return descriptor;
  };
}
