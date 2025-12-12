# ADK Telemetry Extension

ADK Telemetry is a VS Code extension that captures developer workflow events such as file edits, diagnostics, cursor changes, and workspace activity. These events are sent securely to an AWS Lambda Function URL for real-time analysis and graph-based developer productivity insights.

## Features

- Tracks file open, save, close
- Tracks text edits and cursor movement
- Tracks diagnostics (errors & warnings)
- Tracks window focus and active editor changes
- Sends events to ADK Graph backend

## Requirements

No special configuration is required.
The extension automatically detects the user ID from `~/.adk/user.json`.

## Extension Settings

This extension contributes no settings at this time.

## Release Notes

### 0.0.1

Initial release of ADK Telemetry.

