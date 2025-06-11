#!/usr/bin/env node

export default {
  command: "checkout",
  aliases: [],
  describe: "Checkout merge request",
  handler: async () => {
    console.log("checkout");
  }
};
