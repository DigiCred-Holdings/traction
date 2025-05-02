import messageService from './services/message-service';
import redisService from './services/redis-service';
import dotenv from 'dotenv';

dotenv.config();

async function processQueue() {
  console.log('Message Queue Processor: Starting');
  
  const isRedisHealthy = await redisService.checkRedisHealth();
  if (!isRedisHealthy) {
    console.error('Message Queue Processor: Redis is not healthy. Exiting.');
    process.exit(1);
  }
  
  console.log('Message Queue Processor: Redis is healthy');
  console.log(`Message Queue Processor: Watching queue "${redisService.QUEUES.MESSAGES}"`);
  
  try {
    const isRunning = true;
    let messageProcessed = false;
    let processedCount = 0;
    let errorCount = 0;
    
    while (isRunning) {
      try {
        messageProcessed = await messageService.processMessageFromQueue();
        
        if (messageProcessed) {
          processedCount++;
          if (processedCount % 10 === 0) {
            console.log(`Message Queue Processor: Processed ${processedCount} messages`);
          }
        } else {
          if (processedCount > 0) {
            console.log(`Message Queue Processor: Queue empty after processing ${processedCount} messages`);
            processedCount = 0;
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        errorCount = 0;
      } catch (error) {
        errorCount++;
        console.error(`Message Queue Processor: Error processing message (${errorCount}):`, error);
        
        if (errorCount > 5) {
          console.error('Message Queue Processor: Too many consecutive errors. Restarting.');
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    console.error('Message Queue Processor: Fatal error:', error);
  }
  
  console.log('Message Queue Processor: Restarting...');
  process.exit(1);
}

process.on('SIGINT', async () => {
  console.log('Message Queue Processor: Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Message Queue Processor: Shutting down gracefully...');
  process.exit(0);
});

processQueue().catch(error => {
  console.error('Message Queue Processor: Fatal error during startup:', error);
  process.exit(1);
});