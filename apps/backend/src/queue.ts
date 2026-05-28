import { Queue, QueueOptions } from "bullmq";

let queueInstance: Queue | null = null;
let queueDisabledReason: string | null = null;

const resolveQueueOptions = (): QueueOptions => {
  const redisUrl = process.env.REDIS_URL?.trim();

  if (redisUrl) {
    return {
      connection: {
        url: redisUrl,
        maxRetriesPerRequest: null,
      },
    };
  }

  const host = process.env.REDIS_HOST?.trim();
  const port = Number(process.env.REDIS_PORT || 6379);

  if (!host) {
    throw new Error("Redis is not configured. Set REDIS_URL or REDIS_HOST.");
  }

  return {
    connection: {
      host,
      port,
      maxRetriesPerRequest: null,
    },
  };
};

export const getUploadQueue = () => {
  if (queueDisabledReason) {
    throw new Error(queueDisabledReason);
  }

  if (queueInstance) {
    return queueInstance;
  }

  try {
    queueInstance = new Queue("file-upload-queue", resolveQueueOptions());
    queueInstance.on("error", (error) => {
      console.error("BullMQ connection error:", error.message);
    });
    return queueInstance;
  } catch (error) {
    queueDisabledReason =
      error instanceof Error ? error.message : "Unknown Redis configuration error";
    throw new Error(queueDisabledReason);
  }
};
