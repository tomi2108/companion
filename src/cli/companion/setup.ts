#!/usr/bin/env node

import { Config } from "../../lib/config";

export default {
  command: "setup",
  aliases: [],
  describe: "Setup companion",
  handler: async () => {
    await Config.get().setup();
  }
};
