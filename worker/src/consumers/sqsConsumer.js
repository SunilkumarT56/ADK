import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "../config/aws.js";
import dotenv from "dotenv";
dotenv.config();
import { sendToKafka } from "../producers/kafkaProducer.js";

console.log("AWS REGION:", process.env.AWS_REGION);
console.log("AWS KEY:", process.env.AWS_ACCESS_KEY_ID);
console.log(
  "AWS SECRET:",
  process.env.AWS_SECRET_ACCESS_KEY?.slice(0, 5) + "************"
);

export async function pollSQS() {
  console.log("⏳ Worker polling SQS...");

  const command = new ReceiveMessageCommand({
    QueueUrl: process.env.SQS_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 10,
  });

  while (true) {
    const response = await sqs.send(command);

    if (!response.Messages || response.Messages.length === 0) {
      continue;
    }

    for (const msg of response.Messages) {
      const data = JSON.parse(msg.Body);

      await sendToKafka(data);

      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.SQS_URL,
          ReceiptHandle: msg.ReceiptHandle,
        })
      );

      console.log("✔️ Deleted from SQS:", msg.MessageId);
    }
  }
}
