const Enquirer = require("enquirer");

async function input(opts) {
  return await Enquirer.input(opts);
}

async function password(opts) {
  return await Enquirer.password(opts);
}

async function search(opts) {
  return await Enquirer.autocomplete(opts);
}

module.exports = { password, input, search };
