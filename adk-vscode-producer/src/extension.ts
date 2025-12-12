import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import fetch from "cross-fetch";



function getAdkUserId(): string {
  try {
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, ".adk", "user.json");

    if (!fs.existsSync(filePath)) {
      console.error("ADK user.json not found.");
      return "unknown";
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);

    return json.userId ?? "unknown";
  } catch (err) {
    console.error("Failed reading ADK user.json:", err);
    return "unknown";
  }
}



async function sendAdkEvent(eventType: string, rawData: any) {
  const { v4: uuidv4 } = await import("uuid");
  const userId = getAdkUserId();

  const event = {
    event_id: uuidv4(),
    user_id: userId,
    source: "vscode",
    event_type: eventType,
    timestamp: Date.now(),

    context: {
      os: os.platform(),
      editor: "vscode",
      shell: null,
      project: vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath ?? "unknown",
      session_id: uuidv4(),
    },

    payload: {
      raw: rawData,
      normalized: normalizeEvent(eventType, rawData),
    },

    version: 1,
  };

  console.log("ADK Unified Event: ", event);

  try {
    const ADK_API_URL = process.env.ADK_API_URL || "localhost:4000";

    await fetch(
      `http://${ADK_API_URL}/ingest`, // TODO: change to https
      { method: "POST", body: JSON.stringify(event) }
    );
  } catch (err) {
    console.error("ADK POST failed:", err);
  }
}



function normalizeEvent(type: string, data: any) {
  switch (type) {
    case "file_open":
      return {
        file: data.fileName,
        lang: data.language,
      };

    case "file_save":
      return {
        file: data.fileName,
      };

    case "file_edit":
      return {
        file: data.fileName,
        changeCount: data.changes.length,
      };

    case "file_focus":
      return {
        file: data.fileName,
        lang: data.language,
      };

    case "window_state":
      return {
        focused: data.focused,
      };

    case "diagnostics":
      return {
        count: data.diagnosticsCount,
      };

    case "file_created":
    case "file_deleted":
      return {
        file: data.file,
      };

    case "file_renamed":
      return {
        from: data.old,
        to: data.new,
      };

    case "cursor_selection":
      return {
        file: data.fileName,
        selectionCount: data.selection.length,
      };

    default:
      return data;
  }
}



export function activate(context: vscode.ExtensionContext) {
  console.log("ADK Unified Telemetry Extension Active!");

  vscode.workspace.onDidOpenTextDocument((doc) => {
    sendAdkEvent("file_open", {
      fileName: doc.fileName,
      language: doc.languageId,
    });
  });

  vscode.workspace.onDidSaveTextDocument((doc) => {
    sendAdkEvent("file_save", { fileName: doc.fileName });
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    sendAdkEvent("file_edit", {
      fileName: event.document.fileName,
      changes: event.contentChanges,
    });
  });

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      sendAdkEvent("file_focus", {
        fileName: editor.document.fileName,
        language: editor.document.languageId,
      });
    }
  });

  vscode.window.onDidChangeWindowState((state) => {
    sendAdkEvent("window_state", { focused: state.focused });
  });

  vscode.languages.onDidChangeDiagnostics(() => {
    const diagnostics = vscode.languages.getDiagnostics();
    sendAdkEvent("diagnostics", { diagnosticsCount: diagnostics.length });
  });

  vscode.workspace.onDidCreateFiles((event) => {
    event.files.forEach((file) =>
      sendAdkEvent("file_created", { file: file.fsPath })
    );
  });

  vscode.workspace.onDidDeleteFiles((event) => {
    event.files.forEach((file) =>
      sendAdkEvent("file_deleted", { file: file.fsPath })
    );
  });

  vscode.workspace.onDidRenameFiles((event) => {
    event.files.forEach((rename) => {
      sendAdkEvent("file_renamed", {
        old: rename.oldUri.fsPath,
        new: rename.newUri.fsPath,
      });
    });
  });

  vscode.window.onDidChangeTextEditorSelection((event) => {
    sendAdkEvent("cursor_selection", {
      fileName: event.textEditor.document.fileName,
      selection: event.selections,
    });
  });

  vscode.workspace.onDidChangeConfiguration((event) => {
    sendAdkEvent("config_change", {
      affects: event.affectsConfiguration,
    });
  });

  vscode.workspace.onDidCloseTextDocument((doc) => {
    sendAdkEvent("file_close", { fileName: doc.fileName });
  });
}

export function deactivate() {}