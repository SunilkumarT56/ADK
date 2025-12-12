import { pool } from "./db.mjs";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

const ADK_API_URL = process.env.ADK_API_URL || "localhost:4000";

export const handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.user || "unknown-user";
    const body = JSON.parse(event.body || "{}");

    const eventType = event.headers["x-github-event"] || "unknown";
    const repo = body?.repository?.full_name || "unknown-repo";
    const actor = body?.sender?.login || "unknown";
    const branch =
      body?.ref?.replace("refs/heads/", "") ||
      body?.pull_request?.head?.ref ||
      null;

    let commitCount = 0;
    let commitMsg = null;

    if (eventType === "push") {
      commitCount = body.commits?.length || 0;
      commitMsg = body.head_commit?.message || null;
    }

    const unifiedEvent = {
      event_id: uuidv4(),
      user_id: userId,
      source: "github",
      event_type: eventType,
      timestamp: Date.now(),

      context: {
        repo,
        branch,
        actor,
        session_id: uuidv4(),
      },

      payload: {
        raw: body,
        normalized: normalizeGithub(eventType, body),
      },

      version: 1,
    };

    console.log("\n===== UNIFIED GITHUB EVENT =====");
    console.log(JSON.stringify(unifiedEvent, null, 2));
    console.log("================================\n");
    try {
      const ADK_API_URL = process.env.ADK_API_URL || "localhost:4000";
      await fetch(
        `http://${ADK_API_URL}/ingest`, // TODO: change to https
        { method: "POST", body: JSON.stringify(unifiedEvent) }
      );
    } catch (err) {
      console.error("ADK POST failed:", err);
    }

    const query = `
      INSERT INTO adk_github_events
        (user_id, repo, event_type, github_actor, branch, commit_count, commit_message, timestamp, raw_payload)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;

    const values = [
      userId,
      repo,
      eventType,
      actor,
      branch,
      commitCount,
      commitMsg,
      unifiedEvent.timestamp,
      unifiedEvent,
    ];

    const result = await pool.query(query, values);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        eventId: result.rows[0].id,
      }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
};

function normalizeGithub(type, body) {
  switch (type) {
    case "push":
      return {
        commit_count: body.commits?.length || 0,
        added: body.commits?.flatMap((c) => c.added).length || 0,
        removed: body.commits?.flatMap((c) => c.removed).length || 0,
        modified: body.commits?.flatMap((c) => c.modified).length || 0,
        pusher: body.pusher?.name,
      };

    case "pull_request":
      return {
        action: body.action,
        author: body.pull_request?.user?.login,
        merged: body.pull_request?.merged ?? false,
        additions: body.pull_request?.additions,
        deletions: body.pull_request?.deletions,
      };

    default:
      return { info: "no_normalization_available" };
  }
}
