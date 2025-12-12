import axios from "axios";

export async function simulateTerminal() {
  const event = {
    source: "terminal",
    userId: "adk-001",
    command: "git push",
    cwd: "/Users/sunil/project",
    timestamp: Date.now()
  };

  const res = await axios.post("http://127.0.0.1:8080/ingest", event);
  console.log("Terminal event sent →", res.data);
}

simulateTerminal();