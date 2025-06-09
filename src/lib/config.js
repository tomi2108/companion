export const config = {
  paths: {
    scripts: "",
    ms: "",
    mf: "",
    oc: "",
    "3scale": "",
    argocd: "",
    logs: ""
  },
  user: {
    oc: "",
    gitlab: ""
  },
  preferences: {
    browser: ""
  }
};

// export function configGet(key, c = config) {
//   const [entry, ...rest] = key.split(".");
//   const cfg = c[entry];
//   if (typeof cfg !== "object") return cfg;
//   return configGet(rest.join("."), cfg);
// }
