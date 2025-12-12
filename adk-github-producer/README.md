# ADK GitHub Telemetry — Automated Webhook Installer for ADK-Graph

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![GitHub](https://img.shields.io/badge/GitHub-Webhooks-black)
![CLI](https://img.shields.io/badge/CLI-Tool-green)
![Node](https://img.shields.io/badge/Node-18+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**ADK GitHub Telemetry** is an automation-focused CLI tool that installs GitHub Webhooks across one or many repositories with a single command.
It powers the **GitHub activity layer** of **ADK-Graph**, enabling analytics on commits, pushes, PRs, issues, workflows, and coding behavior.

This package is designed to work alongside:

- **ADK Terminal Telemetry (ZSH command tracker)**
- **ADK VS Code Telemetry (editor activity engine)**
- **ADK Browser Dev Telemetry (Chrome extension)**

Together, they form a unified **Developer Activity Graph**.

---

## 🚀 Features

### ✔ Automatic GitHub Webhook Installation

- Installs a webhook on **single or all repos**
- Uses GitHub API with secure PAT authentication
- Works with **private, public, and organization repos**
- Sends every GitHub event (`*`) to your backend

### ✔ Smart Repository Selector (UI)

- Uses an interactive selector with multi-select
- Allows **Select All**
- Clean terminal UI (powered by inquirer-select-pro)

### ✔ Secure Storage

Stores configuration in:

```
~/.adk/github.json
```

Fields include:

- userId (from ADK global identity)
- repositories linked
- PAT (optionally encrypted in future)
- webhook URL used

### ✔ ADK-Graph Compatible Payloads

Every GitHub event includes:

- User identity (`userId`)
- Repository
- Event type
- Original GitHub payload
- Timestamp

---

## 📦 Installation

```
npm install -g adk-github
```

---

## 🛠 Usage

Run the setup command:

```
adk-github
```

Follow the steps:

1. Enter your **GitHub Personal Access Token**Required scopes:

   - `repo`
   - `admin:repo_hook`
2. Select repositories
3. The webhook is installed automatically
4. Config is saved locally
5. Events start flowing into your backend

---

## 🔐 Required GitHub PAT Scopes

Your PAT must include:

```
repo
admin:repo_hook
```

These allow:

- Listing your repos
- Creating webhooks
- Receiving events

---

## 📡 Webhook Event Example

Your backend receives:

```json
{
  "userId": "adk-92831asd1",
  "repository": "sunil/my-project",
  "event": "push",
  "timestamp": 1733921839123,
  "data": {
    "ref": "refs/heads/main",
    "commits": [...],
    "pusher": {...}
  }
}
```

---

## 📁 Config File Example

```
~/.adk/github.json
```

```json
{
  "userId": "adk-92831asd1",
  "accessToken": "ghp_xxxxx",
  "repos": ["sunil/project1", "sunil/project2"],
  "webhookUrl": "https://your-backend-url/github-webhook"
}
```

---

## 🧠 Purpose — Why This Exists

GitHub is where your **final work** appears.But ADK-Graph combines signals from:

- Editor
- Terminal
- Browser
- GitHub

GitHub events help measure:

- Commit patterns
- Deployment frequency
- Issue workflow
- Pull Request cycle
- DevOps behavior
- Review latency
- Branch strategy discipline

With all four signals combined, ADK-Graph builds a **Developer Knowledge Graph** that reveals:

- Your productivity flow
- Debugging style
- Context switching behavior
- Skill progression over time
- Project-level complexity evolution

---

## 🔧 Tech Stack

- Node.js 18+
- Axios (GitHub API calls)
- Inquirer + inquirer-select-pro
- Ora (loading indicators)
- fs-extra
- ADK Local Identity File (`~/.adk/user.json`)

---

## 📝 License

MIT © 2025 Sunil Kumar

---

## ⭐ Support

If you like this project, kindly star ⭐ the repo — it motivates development!

---
# adk-github
# adk-github
# adk-github
