import { JsonFormatter } from "@files/formatters/json_formatter";
import { TextFile } from "@files/text_file";
import { createLogFile } from "@files/utils";
import { Dir } from "@interface/dirs/dir";

import { Event } from "./events";

export class EventLogger {
  file: TextFile;

  constructor() {
    this.file = createLogFile(new Date().toISOString(), new Dir("events"));
  }

  log(event: Event) {
    const formatter = new JsonFormatter();
    const data = {
      type: event.constructor.name,
      occurredAt: event.occurredAt.toISOString(),
      payload: event.ctx
    };
    this.file.appendLine(formatter.toString(data));
  }

}
