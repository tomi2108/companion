#!/usr/bin/env node

import { setupConfig } from "../../lib/config.js";

(async () => {
  await setupConfig();
})();
