# ADK-CLI...

ADK CLI is a lightweight command-tracking tool designed for developers who want to log and analyze their terminal usage.
It captures every terminal command and sends it to a backend endpoint (AWS Lambda + Supabase Postgres) for analytics and storage. A lightweight developer-behavior telemetry CLI that tracks terminal commands using a silent Zsh `preexec` hook and sends structured events to your backend.

* [ ]  ADK-CLI automatically installs a command logger into the user’s shell, generates a unique user ID, and sends terminal activity to a configurable HTTP endpoint.
  Perfect for analytics, developer tooling research, productivity apps, or internal telemetry systems.

**Note:**
ADK CLI is currently **under development** and available **only for macOS (zsh)** users.
Windows and Linux support will be added soon.


---

## 🚀 Features

- **Silent terminal command tracking** (no UI noise)
- **Zsh preexec hook injection**
- **Automatic user ID generation**
- **Event logging via Node.js script**
- **Customizable backend endpoint**
- **Zero performance impact**
- **Fully asynchronous background execution**
- **Simple local backend integration**

---

## 📦 Installation

Install globally:

```sh
npm install -g adk-cli
adk init
source ~/.zshrc

```
