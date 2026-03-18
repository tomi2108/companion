import { ActionRegistry } from "./registry";

export interface Action {
  register(actionRegistry: ActionRegistry): void;
}

