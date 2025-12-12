const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function generateUserId() {
  return "adk-" + crypto.randomBytes(6).toString("hex");
}

function appendIfNotPresent(filePath, content, marker) {
  let existing = "";
  if (fileExists(filePath)) {
    existing = fs.readFileSync(filePath, "utf8");
    if (marker && existing.includes(marker)) return;
  }
  fs.appendFileSync(filePath, "\n" + content + "\n");
}

function installForZsh(homeDir, loggerDest, userId) {
  const zshrcPath = path.join(homeDir, ".zshrc");
  const marker = "# ADK-GRAPH TERMINAL HOOK-V3";

  const hook = `
${marker}

setopt NO_NOTIFY
setopt NO_PROMPT_SP

export ADK_USER_ID="${userId}"
export ADK_LOGGER="$HOME/.adk/adk-log.js"

preexec() {
    { node "$ADK_LOGGER" "$1" >/dev/null 2>&1 } &!x
}
`;

  appendIfNotPresent(zshrcPath, hook, marker);
  console.log(`Updated Zsh config: ${zshrcPath}`);
}

async function runInit() {
  const platform = os.platform();
  const homeDir = os.homedir();
  const adkDir = path.join(homeDir, ".adk");

  if (!fileExists(adkDir)) {
    fs.mkdirSync(adkDir, { recursive: true });
    console.log(`Created directory: ${adkDir}`);
  } else {
    console.log(`Directory already exists: ${adkDir}`);
  }

  const loggerSrc = path.join(__dirname, "..", "templates", "adk-log.js");
  const loggerDest = path.join(adkDir, "adk-log.js");

  fs.copyFileSync(loggerSrc, loggerDest);
  fs.chmodSync(loggerDest, 0o755);

  console.log(`Installed logger: ${loggerDest}`);

  const userId = generateUserId();
  const userJsonPath = path.join(adkDir, "user.json");
  const userJsonContent = JSON.stringify({ userId }, null, 2);

  try {
    fs.writeFileSync(userJsonPath, userJsonContent, "utf8");
  } catch (err) {}

  if (platform === "darwin" || platform === "linux") {
    installForZsh(homeDir, loggerDest, userId);

    try {
      execSync(`source ${path.join(homeDir, ".zshrc")}`, {
        stdio: "ignore",
        shell: "/bin/zsh",
      });
      console.log("Automatically reloaded ~/.zshrc.");
    } catch {
      console.log("Could not auto-reload zshrc. Run manually: source ~/.zshrc");
    }
  } else {
    console.log(`Unsupported platform: ${platform}`);
  }

  console.log(`
ADK initialization completed.

User ID: ${userId}

You can now use your terminal normally. Commands will be tracked automatically.
`);
}

module.exports = { runInit };
