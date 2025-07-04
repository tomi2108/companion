#!/usr/bin/env bash

git pull
npm uninstall -g companion
npm run clean
npm install
npm run build
npm run test
npm install -g .
