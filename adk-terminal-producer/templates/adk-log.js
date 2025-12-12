const https = require("https");
const os = require("os");
const path = require("path");
const { v4: uuidv4 } = require("uuid");



const command = process.argv.slice(2).join(" ");
if (!command || command.trim() === "") process.exit(0);



const ignoredCommands = ["ls", "cd", "pwd", "clear", "history"];
if (ignoredCommands.includes(command.trim())) process.exit(0);



const ADK_USER_ID =
  process.env.ADK_USER_ID || "unknown-user";

const ADK_API_URL =
  process.env.ADK_API_URL ||
  "localhost:4000";

const url = new URL(`http://${ADK_API_URL}/ingest`); // TODO: change to https


const event = {
  event_id: uuidv4(),
  user_id: ADK_USER_ID,
  source: "terminal",
  event_type: "shell_command",
  timestamp: Date.now(),

  context: {
    os: os.platform(),
    editor: null,
    shell: process.env.SHELL || "unknown",
    project: process.cwd(),
    session_id: uuidv4(),
  },

  payload: {
    raw: {
      command: command.trim(),
      workingDir: process.cwd(),
    },

   
    normalized: {
      cmd: command.split(" ")[0], 
      args: command.split(" ").slice(1),
      length: command.length,
      is_sudo: command.startsWith("sudo"),
    },
  },

  version: 1,
};



const payload = JSON.stringify(event);

const options = {
  hostname: url.hostname,
  path: url.pathname,
  port: 443,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  },
  timeout: 200,
};

const req = https.request(options, (res) => {
  res.on("data", () => {});
});

req.on("error", () => {});
req.on("timeout", () => req.destroy());

req.write(payload);
req.end();