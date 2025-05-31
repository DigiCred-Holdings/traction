import { Pool } from "pg";
import dotenv from "dotenv";
import acaPyService from '../services/acapy-service';
import redisService from '../services/redis-service';

dotenv.config();

const dbConfig = {
  host: process.env.POSTGRESQL_HOST || "localhost",
  port: parseInt(process.env.POSTGRESQL_PORT || "5432"),
  database: process.env.POSTGRESQL_DB || "askar-wallet",
  user: process.env.POSTGRESQL_USER || "postgres",
  password: process.env.POSTGRESQL_PASSWORD || "postgresPass",
};
const redisConfig = {
  ttl: parseInt(process.env.REDIS_TTL || "3600"),
};

const pool = new Pool(dbConfig);

export enum ItemKind {
  Connection = "Connection",
  StudentID = "StudentID",
  Transcript = "Transcript", 
  Message = "Message",
  Invited = "Invited",
  Failed = "Failed"
}

export const countItemsByKind = async (forceRefresh: boolean = false) => {
  console.log("Database: Counting items by kind (type) using ACA-Py API for connections and credentials only");
  console.log(`Force refresh requested: ${forceRefresh}`);

  try {
    type SummaryItem = {
      kind: ItemKind;
      kind_id: number;
      count: number;
      source: string;
    };

    type CredDefSummary = {
      [credDefTag: string]: {
        credDefId: string;
        tag: string;
        count: number;
        records: any[];
      };
    };

    if (!forceRefresh) {
      const cachedResults = await redisService.redisClient.get('summary:items_by_kind');
      if (cachedResults) {
        console.log("Using cached results from Redis");
        return JSON.parse(cachedResults);
      }
    } else {
      console.log("Cache bypassed due to force refresh request.");
    }

    const formattedResults: SummaryItem[] = [];
    const credDefSummary: CredDefSummary = {};

    let connectionCount = 0;
    let connectionDetails = [];
    try {
      const connectionsResponse = await acaPyService.getConnections();
      // console.log("connectionsResponse", connectionsResponse);
      if (connectionsResponse && connectionsResponse.results) {
        connectionCount = connectionsResponse.results.length;
        connectionDetails = connectionsResponse.results.map((conn: any) => ({
          id: conn.connection_id,
          state: conn.state,
          alias: conn.alias || 'Unknown',
          created_at: conn.created_at
        }));
        // console.log(`AcaPy API returned ${connectionCount} connections`);
        
        await redisService.redisClient.set('connections:all', JSON.stringify(connectionDetails), {
          EX: redisConfig.ttl
        });
      } else {
        // console.log('AcaPy API returned no connections or unexpected format');
        
        const cachedConnections = await redisService.redisClient.get('connections:all');
        if (cachedConnections) {
          connectionDetails = JSON.parse(cachedConnections);
          connectionCount = connectionDetails.length;
          // console.log(`Using ${connectionCount} cached connections from Redis`);
        }
      }
    } catch (error: any) {
      console.warn(`Could not fetch connections from ACA-Py API: ${error.message}`);
      
      const cachedConnections = await redisService.redisClient.get('connections:all');
      if (cachedConnections) {
        connectionDetails = JSON.parse(cachedConnections);
        connectionCount = connectionDetails.length;
        console.log(`Using ${connectionCount} cached connections from Redis after API error`);
      }
    }

    let credentialCount = 0;
    console.log("credentialCount", credentialCount);
    let credentialDetails = {
      legacy: [] as any[],
      w3c: [] as any[],
      studentId: [] as any[],
      transcript: [] as any[]
    };

    try {
      const credentialsResponse = await acaPyService.getAllIssuedCredentials();
      // console.log("credentialsResponse", JSON.stringify(credentialsResponse, null, 2));
      if (credentialsResponse) {
        const v1Records = credentialsResponse.v1 || [];
        const v2Records = credentialsResponse.v2 || [];
        credentialCount = v1Records.length + v2Records.length;

        const allRecords = [...v1Records, ...v2Records];
        
        for (const record of allRecords) {
          const credExRecord = record.cred_ex_record;
          if (credExRecord && credExRecord.state === 'done') {
            const credDefId = credExRecord.by_format?.cred_proposal?.indy?.cred_def_id ||
                            credExRecord.by_format?.cred_offer?.indy?.cred_def_id;
            
            if (credDefId) {
              const credDefTag = credDefId.split(':').pop() || 'Unknown';
              
              // Initialize or update the credential definition summary
              if (!credDefSummary[credDefTag]) {
                credDefSummary[credDefTag] = {
                  credDefId: credDefId,
                  tag: credDefTag,
                  count: 0,
                  records: []
                };
              }
              
              credDefSummary[credDefTag].count++;
              credDefSummary[credDefTag].records.push(record);
              
              // Keep legacy categorization for backward compatibility
              const credDefTagUpper = credDefTag.toUpperCase();
              if (credDefTagUpper.includes('STUDENT') && credDefTagUpper.includes('CARD')) {
                credentialDetails.studentId.push(record);
              } else if (credDefTagUpper.includes('TRANSCRIPT')) {
                credentialDetails.transcript.push(record);
              }
            }
          }
        }
        
        // console.log(`AcaPy API returned ${credentialCount} credentials`);
        // console.log('Credential Definition Summary:', credDefSummary);
        
        await redisService.redisClient.set('credentials:all', JSON.stringify(credentialDetails), {
          EX: redisConfig.ttl
        });
        
        // Store credential definition summary separately
        await redisService.redisClient.set('credentials:by_cred_def', JSON.stringify(credDefSummary), {
          EX: redisConfig.ttl
        });
      } else {
        console.log('AcaPy API returned no credentials or unexpected format');
        
        const cachedCredentials = await redisService.redisClient.get('credentials:all');
        const cachedCredDefSummary = await redisService.redisClient.get('credentials:by_cred_def');
        
        if (cachedCredentials) {
          credentialDetails = JSON.parse(cachedCredentials);
          credentialCount = (credentialDetails.legacy?.length || 0) + (credentialDetails.w3c?.length || 0);
          console.log(`Using cached credentials from Redis`);
        }
        
        if (cachedCredDefSummary) {
          Object.assign(credDefSummary, JSON.parse(cachedCredDefSummary));
          console.log(`Using cached credential definition summary from Redis`);
        }
      }
    } catch (error: any) {
      console.warn(`Could not fetch credentials from ACA-Py API: ${error.message}`);
      
      const cachedCredentials = await redisService.redisClient.get('credentials:all');
      const cachedCredDefSummary = await redisService.redisClient.get('credentials:by_cred_def');
      
      if (cachedCredentials) {
        credentialDetails = JSON.parse(cachedCredentials);
        credentialCount = (credentialDetails.legacy?.length || 0) + (credentialDetails.w3c?.length || 0);
        console.log(`Using cached credentials from Redis after API error`);
      }
      
      if (cachedCredDefSummary) {
        Object.assign(credDefSummary, JSON.parse(cachedCredDefSummary));
        console.log(`Using cached credential definition summary from Redis after API error`);
      }
    }

    const filteredConnections = connectionDetails.filter((conn: any) => conn.state === 'active');
    
    await redisService.redisClient.set('connections:active', JSON.stringify(filteredConnections), {
      EX: redisConfig.ttl 
    });

    formattedResults.push({
      kind: ItemKind.Connection,
      kind_id: 1,
      count: filteredConnections.length,
      source: 'acapy',
    });

    console.log("connectionDetails", connectionDetails);
    const invitedConnections = connectionDetails.filter((conn: any) => conn.state === 'request' || conn.state === 'invitation');
    
    await redisService.redisClient.set('connections:invited', JSON.stringify(invitedConnections), {
      EX: redisConfig.ttl 
    });

    formattedResults.push({
      kind: ItemKind.Invited,
      kind_id: 4,
      count: invitedConnections.length,
      source: 'acapy',
    });

    const failedConnections = connectionDetails.filter((conn: any) => conn.state === 'error');

    await redisService.redisClient.set('connections:failed', JSON.stringify(failedConnections), {
      EX: redisConfig.ttl
    });

    formattedResults.push({
      kind: ItemKind.Failed,
      kind_id: 5,
      count: failedConnections.length,
      source: 'acapy',
    });

    formattedResults.push({
      kind: ItemKind.Message,
      kind_id: 6,
      count: 0,
      source: 'acapy',
    });

    console.log("\n=== Summary by Kind (ACA-Py data only) ===");
    formattedResults.forEach((item: any) => {
      console.log(`${item.kind} (${item.kind_id}): ${item.count} items from ${item.source}`);
    });
    
    console.log("\n=== Credential Definition Summary ===");
    Object.entries(credDefSummary).forEach(([tag, data]) => {
      console.log(`${tag}: ${data.count} credentials`);
    });
    
    await redisService.redisClient.set('summary:items_by_kind', JSON.stringify(formattedResults), {
      EX: redisConfig.ttl 
    });

    console.log("\n=== Summary by Kind ===");
    formattedResults.forEach((item: any) => {
      console.log(`${item.kind} (${item.kind_id}): ${item.count} items`);
    });

    return formattedResults;
  } catch (error) {
    console.error("Database: Error counting items by kind:", error);
    throw error;
  }
};

export const getActiveConnections = async (): Promise<any[]> => {
  try {
    const connectionsResponse = await acaPyService.getConnections();
    if (connectionsResponse && connectionsResponse.results) {
      const connections = connectionsResponse.results;
      const activeConnections = connections.filter((conn: any) => conn.state === 'active');
      
      await redisService.redisClient.set('connections:active', JSON.stringify(activeConnections), {
        EX: redisConfig.ttl 
      });
      
      return activeConnections;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting active connections:", error);
    throw error;
  }
};

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await pool.end();
  process.exit(0);
});
