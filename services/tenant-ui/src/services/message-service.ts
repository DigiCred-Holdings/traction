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

export const processMessageFromQueue = async (): Promise<boolean> => {
  try {
    const item = await redisService.getFromQueue(redisService.QUEUES.MESSAGES, 5);
    
    if (!item) {
      return false;
    }
    
    console.log(`Processing message to connection ${item.connectionId}`);
    
    if (item.token) {
      console.log('Setting token from queue message');
      acaPyService.setToken(item.token);
    }
    
    await acaPyService.sendBasicMessage(item.connectionId, item.message);
    
    console.log(`Successfully sent message to connection ${item.connectionId}`);
    return true;
  } catch (error) {
    console.error('Error processing message from queue:', error);
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
  sendMessageToConnection
};