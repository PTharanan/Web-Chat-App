import { Queue, Worker } from "bullmq";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../utils/env.js";

const QUEUE_NAME = "email";

let emailQueue;
let emailWorker;

const getRedisConnection = () => {
    if (!ENV.REDIS_URL) {
        throw new Error("REDIS_URL is required to run the email queue.");
    }

    const redisURL = new URL(ENV.REDIS_URL);
    if (redisURL.protocol !== "redis:" && redisURL.protocol !== "rediss:") {
        throw new Error("REDIS_URL must use the redis:// or rediss:// protocol.");
    }

    const database = redisURL.pathname.slice(1);
    return {
        host: redisURL.hostname,
        port: Number(redisURL.port || 6379),
        username: redisURL.username ? decodeURIComponent(redisURL.username) : undefined,
        password: redisURL.password ? decodeURIComponent(redisURL.password) : undefined,
        db: database ? Number(database) : undefined,
        tls: redisURL.protocol === "rediss:" ? {} : undefined,
        maxRetriesPerRequest: null
    };
};

const getEmailQueue = () => {
    if (!emailQueue) {
        emailQueue = new Queue(QUEUE_NAME, {
            connection: getRedisConnection(),
            defaultJobOptions: {
                attempts: 5,
                backoff: {
                    type: "exponential",
                    delay: 8000
                },
                removeOnComplete: 1000,
                removeOnFail: 1000
            }
        });
        emailQueue.on("error", (error) => {
            console.error("Welcome email queue error:", error);
        });
    }

    return emailQueue;
};

export const enqueueWelcomeEmail = async ({ userId, email, name, clientURL }) => {
    await getEmailQueue().add(
        "send-welcome-email",
        { email, name, clientURL },
        { jobId: `welcome-${userId}` }
    );
};

export const startWelcomeEmailWorker = async () => {
    if (emailWorker) {
        return emailWorker;
    }

    emailWorker = new Worker(
        QUEUE_NAME,
        async (job) => {
            if (job.name !== "send-welcome-email") {
                throw new Error(`Unsupported email job: ${job.name}`);
            }

            const { email, name, clientURL } = job.data;
            await sendWelcomeEmail(email, name, clientURL);
        },
        {
            connection: getRedisConnection(),
            concurrency: 5
        }
    );

    emailWorker.on("error", (error) => {
        console.error("Welcome email worker error:", error);
    });
    emailWorker.on("failed", (job, error) => {
        console.error("Welcome email job failed:", {
            jobId: job?.id,
            attemptsMade: job?.attemptsMade,
            error: error.message
        });
    });

    await emailWorker.waitUntilReady();
    console.log("Welcome email worker is ready");

    return emailWorker;
};
