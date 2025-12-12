import axios from "axios";

export async function simulateVSCode() {
  const event = {
    source: "vscode",
    userId: "adk-001",
    event: "fileSave",
    file: "/src/index.js",
    timestamp: Date.now()
  };

  const res = await axios.post("http://127.0.0.1:8080/ingest", event);
  console.log("VSCode event sent →", res.data);
}

simulateVSCode();