import {simulateTerminal} from "./simulate-terminal.js";
import {simulateVSCode} from "./simulate-vscode.js";
import {simulateGitHub} from "./simulate-github.js";

async function generateTraffic(count) {
  const tasks = [];

  for (let i = 0; i < count; i++) {
    tasks.push(simulateTerminal());
    tasks.push(simulateVSCode());
    tasks.push(simulateGitHub());
  }

  console.log(`🚀 Sending ${tasks.length} events...`);

  await Promise.all(tasks);

  console.log("✅ Load test complete");
}

generateTraffic(4);  