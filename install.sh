#!/usr/bin/env bash

git pull
npm uninstall -g companion
npm install
npm run build
npm run test
npm install -g .
