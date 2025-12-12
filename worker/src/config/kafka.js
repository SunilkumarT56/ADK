import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const kafka = new Kafka({
  clientId: "adk-worker",
  brokers: ["localhost:9092"], // example: "localhost:9092"
  ssl: false, 
  sasl: false,
});

export default kafka;