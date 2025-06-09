const fs = require("node:fs");
const crypto = require("node:crypto");

function deepMerge(obj1, obj2) {
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key) && obj2[key] !== undefined && obj2[key] !== null) {
      if (obj2[key] instanceof Object && obj1[key] instanceof Object) {
        obj1[key] = deepMerge(obj1[key], obj2[key]);
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
  return obj1;
}

function removePrefix(str, prefix) {
  if (str.startsWith(prefix)) return str.slice(prefix.length);
  return str;
}

function removeSuffix(str, suffix) {
  if (str.endsWith(suffix)) return str.slice(0, -suffix.length);
  return str;
}

function readdirs(p) {
  return fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}

function readfiles(p) {
  return fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name);
}

function md5FromFile(file_path) {
  const content = fs.readFileSync(file_path);
  const hash = crypto.createHash("md5");
  hash.update(content);
  return hash.digest("hex");
}

module.exports = { deepMerge, removePrefix, removeSuffix, readdirs, readfiles, md5FromFile };
