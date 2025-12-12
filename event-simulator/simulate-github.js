import axios from "axios";

export async function simulateGitHub() {
  const event = {
    source: "github",
    userId: "adk-001",
    event: "push",
    repo: "sunil/adk-graph",
    branch: "main",
    commits: 3,
    timestamp: Date.now()
  };

  const res = await axios.post("http://127.0.0.1:8080/ingest", event);
  console.log("GitHub event sent →", res.data);
}

simulateGitHub();