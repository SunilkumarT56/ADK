import { select } from "inquirer-select-pro";
import chalk from "chalk";
import ora from "ora";
import axios from "axios";
import fs from "fs-extra";
import os from "os";
import path from "path";
import inquirer from "inquirer";
import dotenv from "dotenv";
dotenv.config();


function getAdkUserId() {
  try {
    const file = path.join(os.homedir(), ".adk", "user.json");

    if (!fs.existsSync(file)) {
      console.error("⚠ ADK user.json not found.");
      return "unknown-user";
    }

    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    return json.userId || "unknown-user";
  } catch (err) {
    console.error("⚠ Failed reading ADK user.json:", err);
    return "unknown-user";
  }
}

export async function setupGithubWebhooks() {
  console.log(chalk.green("\n🚀 ADK GitHub Webhook Setup\n"));


  const { pat } = await inquirer.prompt([
    {
      type: "password",
      name: "pat",
      message:
        "Enter your GitHub Personal Access Token (Classic: repo + admin:repo_hook):",
      mask: "*",
      validate: (value) => value.length > 0 || "Token cannot be empty",
    },
  ]);

  
  const spinner = ora("Fetching your repositories...").start();
  let repos = [];

  try {
    const res = await axios.get(
      "https://api.github.com/user/repos?per_page=200",
      {
        headers: {
          Authorization: `token ${pat}`,
          "User-Agent": "ADK-GitHub-Agent",
        },
      }
    );

    repos = res.data;
    spinner.succeed("Fetched repositories successfully!");
  } catch (err) {
    spinner.fail("Failed to fetch repositories. Invalid PAT?");
    console.log(err.message);
    return;
  }

  if (repos.length === 0) {
    console.log(chalk.red("⚠ No repositories found for this account."));
    return;
  }

  
  const repoChoices = repos.map((r) => ({
    name: `${r.full_name} ${r.private ? "(Private)" : ""}`,
    value: r.full_name,
  }));

  console.log(chalk.blue("\nSelect repositories to activate ADK tracking:\n"));

  
  const selectedRepos = await select({
    message: "Choose repositories",
    multiple: true,
    options: [
      { name: "🔵 Select All Repositories", value: "__ALL__" },
      ...repoChoices,
    ],
  });

  if (!selectedRepos || selectedRepos.length === 0) {
    console.log(chalk.yellow("\n⚠ No repositories selected. Aborting…\n"));
    return;
  }

  
  const finalRepos = selectedRepos.includes("__ALL__")
    ? repos.map((r) => r.full_name)
    : selectedRepos;

  
  const userId = getAdkUserId();
  console.log(chalk.cyan(`\n📌 ADK User ID: ${userId}\n`));

  const adkWebhookURL =
    "process.env.ADK_WEBHOOK_URL";


  for (const repo of finalRepos) {
    const loader = ora(`Installing webhook for ${repo}...`).start();

    try {
      await axios.post(
        `https://api.github.com/repos/${repo}/hooks`,
        {
          name: "web",
          active: true,
          events: ["*"], 
          config: {
            url: `${adkWebhookURL}?user=${userId}`,
            content_type: "json",
            insecure_ssl: "0",
          },
        },
        {
          headers: {
            Authorization: `token ${pat}`,
            "User-Agent": "ADK-GitHub-Agent",
            Accept: "application/vnd.github+json",
          },
        }
      );

      loader.succeed(`Webhook installed on ${repo}`);
    } catch (err) {
      loader.fail(`Failed on ${repo}`);
      console.log(chalk.red(err.response?.data?.message || err.message));
    }
  }

 
  const adkPath = path.join(os.homedir(), ".adk");
  await fs.ensureDir(adkPath);

  const configPath = path.join(adkPath, "github.json");

  const existingConfig = fs.existsSync(configPath)
    ? await fs.readJson(configPath)
    : {};

  const newConfig = {
    userId,
    accessToken: pat,
    repos: finalRepos,
    webhookUrl: adkWebhookURL,
    ...existingConfig,
  };

  await fs.writeJson(configPath, newConfig, { spaces: 2 });

  console.log("\n✔ GitHub configuration saved in ~/.adk/github.json");

  console.log(chalk.green("\n✅ GitHub Webhook Setup Complete!\n"));
  console.log(chalk.blue(`Repos linked:`));
  finalRepos.forEach((r) => console.log(" - " + r));
  console.log("\n");
}