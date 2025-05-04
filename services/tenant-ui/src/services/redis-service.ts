import { createClient } from 'redis';
import dotenv from "dotenv";

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  ttl: parseInt(process.env.REDIS_TTL || "3600"),
};

const redisClient = createClient({
  url: `redis://${redisConfig.host}:${redisConfig.port}`
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

export const QUEUES = {
  MESSAGES: 'queue:messages',
  SUMMARY: 'queue:summary',
};

export const addToQueue = async (queueName: string, data: any): Promise<void> => {
  try {
    await redisClient.lPush(queueName, JSON.stringify(data));
    console.log(`Added item to queue ${queueName}`);
  } catch (error) {
    console.error(`Error adding to queue ${queueName}:`, error);
    throw error;
  }
};

export const getFromQueue = async (queueName: string, timeout = 0): Promise<any> => {
  try {
    try {
      console.log(`Getting item from queue ${queueName} with timeout ${timeout}s`);
      
      const result = await redisClient.brPop([queueName], timeout);
      
      if (result) {
        console.log(`Got item from queue ${queueName} using brPop`);
        const value = result.element;
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
      }
    } catch (brpopError) {
      console.warn(`Error using brPop, falling back to rPop: ${brpopError}`);
      
      const listLength = await redisClient.lLen(queueName);
      
      if (listLength > 0) {
        const value = await redisClient.rPop(queueName);
        if (value && typeof value === 'string') {
          console.log(`Got item from queue ${queueName} using rPop`);
          return JSON.parse(value);
        }
      } else {
        if (timeout > 0) {
          console.log(`Queue ${queueName} is empty, waiting for ${timeout} seconds`);
          await new Promise(resolve => setTimeout(resolve, timeout * 1000));
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting from queue ${queueName}:`, error);
    throw error;
  }
};

export const queueMessage = async (connectionId: string, message: string, token: string = ''): Promise<void> => {
  await addToQueue(QUEUES.MESSAGES, {
    connectionId,
    message,
    token,
    timestamp: new Date().toISOString(),
  });
};

process.on('SIGINT', async () => {
  console.log('Redis Service: Shutting down...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Redis Service: Shutting down...');
  await redisClient.quit();
  process.exit(0);
});

export default {
  redisClient,
  checkRedisHealth,
  addToQueue,
  getFromQueue,
  queueMessage,
  QUEUES,
};