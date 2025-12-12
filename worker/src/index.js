import { connectProducer } from "./producers/kafkaProducer.js";
import { pollSQS } from "./consumers/sqsConsumer.js";

console.log("🚀 Worker starting...");

await connectProducer();
await pollSQS();