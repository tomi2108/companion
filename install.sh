#!/usr/bin/env bash

npm uninstall -g .
npm install
npm run build
npm install -g .

