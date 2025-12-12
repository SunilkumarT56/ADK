import kafka from "../config/kafka.js";
import dotenv from "dotenv";
dotenv.config();

const producer = kafka.producer();

const TOPIC_MAP = {
  github: "adk-github-events",
  terminal: "adk-terminal-events",
  vscode: "adk-vscode-events",
};

export async function connectProducer() {
  await producer.connect();
  console.log("🔥 Kafka producer connected");
}

export async function sendToKafka(event) {
  const topic = TOPIC_MAP[event.source];

  if (!topic) {
    console.error("❌ Unknown event source:", event.source);
    return;
  }

  await producer.send({
    topic,
    messages: [
      {
        key: event.userId,
        value: JSON.stringify(event),
      },
    ],
  });

  console.log(`📤 Published to Kafka [${topic}]:`, event.command);
}