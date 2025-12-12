import Fastify from "fastify";
import { enqueueEvent } from "./enque/sqs.js";

const fastify = Fastify({
  logger: true,
});

const PORT = process.env.PORT || 4000;

fastify.get("/health", async () => ({ status: "ok" }));
fastify.post("/ingest", async (req, reply) => {
  await enqueueEvent(req.body);

  return { status: "ok", received: true , data: "Event enqueued" };
});

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Ingest running at ${address}`);
});
