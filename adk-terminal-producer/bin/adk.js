#!/usr/bin/env node

// adk CLI entry point
const path = require("path");

function showHelp() {
  console.log(`
ADK CLI - Adaptive Developer Knowledge CLI

Usage:
  adk init     Set up ADK tracking on this machine
  adk help     Show this help

Example:
  adk init
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help" || command === "--help" || command === "-h") {
    showHelp();
    process.exit(0);
  }

  if (command === "init") {
    const init = require("../src/init");
    init.runInit().catch((err) => {
      console.error("ADK init failed:", err.message || err);
      process.exit(1);
    });
    return;
  }

  console.log(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}

main();