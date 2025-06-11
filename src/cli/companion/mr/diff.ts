#!/usr/bin/env node

export default {
  command: "diff",
  aliases: [],
  describe: "View merge request diff",
  handler: async () => {
    console.log("diff");
  }
};
