import redisService from './redis-service';
import acaPyService from './acapy-service';
import * as databaseComponent from '../components/database';

export const queueBroadcastMessage = async (message: string, token: string = ''): Promise<{queuedCount: number, connections: any[]}> => {
  try {
    console.log(`Message Service: Queuing broadcast message to all active connections`);
    
    const activeConnections = await databaseComponent.getActiveConnections();
    
    if (!activeConnections || activeConnections.length === 0) {
      console.log('No active connections found for broadcast');
      return { queuedCount: 0, connections: [] };
    }
    
    console.log(`Found ${activeConnections.length} active connections for broadcast`);
    
    let queuedCount = 0;
    for (const connection of activeConnections) {
      if (connection.connection_id) {
        await redisService.queueMessage(connection.connection_id, message, token);
        queuedCount++;
      }
    }
    
    console.log(`Successfully queued ${queuedCount} messages for broadcast`);
    
    return {
      queuedCount,
      connections: activeConnections
    };
  } catch (error) {
    console.error('Error queueing broadcast message:', error);
    throw error;
  }
};

export const queueSummaryUpdate = async (token: string = ''): Promise<void> => {
  try {
    console.log('Message Service: Queuing summary update request');
    await redisService.addToQueue(redisService.QUEUES.SUMMARY, {
      token,
      timestamp: new Date().toISOString(),
    });
    console.log('Successfully queued summary update request');
  } catch (error) {
    console.error('Error queuing summary update request:', error);
    throw error;
  }
};

export const processMessageFromQueue = async (): Promise<boolean> => {
  try {
    const messageItem = await redisService.getFromQueue(redisService.QUEUES.MESSAGES, 5);
    
    if (messageItem) {
      console.log(`Processing message to connection ${messageItem.connectionId}`);
      
      if (messageItem.token) {
        console.log('Setting token from queue message');
        acaPyService.setToken(messageItem.token);
      }
      
      await acaPyService.sendBasicMessage(messageItem.connectionId, messageItem.message);
      
      console.log(`Successfully sent message to connection ${messageItem.connectionId}`);
      return true;
    }
    
    const summaryItem = await redisService.getFromQueue(redisService.QUEUES.SUMMARY, 5);
    
    if (summaryItem) {
      console.log('Processing summary update request');
      
      if (summaryItem.token) {
        console.log('Setting token from summary update request');
        acaPyService.setToken(summaryItem.token);
      }
      
      console.log('Updating summary with forceRefresh=true');
      await databaseComponent.countItemsByKind(true);
      
      console.log('Successfully processed summary update');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    return false;
  } catch (error) {
    console.error('Error processing from queue:', error);
    return true;
  }
};

export const sendMessageToConnection = async (connectionId: string, message: string, token: string = ''): Promise<any> => {
  try {
    console.log(`Sending message to connection ${connectionId}`);
    
    if (token) {
      await redisService.queueMessage(connectionId, message, token);
      return { status: 'queued' };
    }
    
    return await acaPyService.sendBasicMessage(connectionId, message);
  } catch (error) {
    console.error(`Error sending message to connection ${connectionId}:`, error);
    throw error;
  }
};

export default {
  queueBroadcastMessage,
  processMessageFromQueue,
  sendMessageToConnection,
  queueSummaryUpdate
};