#!/usr/bin/env node

export default {
  command: "build",
  aliases: [],
  describe: "Build merge request",
  handler: async () => {
    console.log("build");
  }
};
