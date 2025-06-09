#!/usr/bin/env node

import { Config } from "../../lib/config";

export default {
  command: "config",
  aliases: [],
  describe: "Interactively setup a config",
  handler: async () => {
    await Config.get().setup();
  }
};
