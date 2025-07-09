import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from 'config';

const TRACTION_URL: string = config.get('server.tractionUrl');

class AcaPyService {
  private token: string;
  private baseUrl: string;

  constructor() {
    this.token = '';
    this.baseUrl = TRACTION_URL;
    console.log('AcaPyService: Initialized with baseUrl:', this.baseUrl);
  }

  setToken(token: string) {
    console.log('AcaPyService: Setting token:', token || 'empty string');
    if (!token || token.trim() === '') {
      this.token = 'TEST_TOKEN_FOR_DEBUGGING';
      console.log('AcaPyService: Using test token for debugging');
    } else {
      this.token = token;
    }
  }

  getToken(): string {
    return this.token;
  }

  async request(
    method: string,
    endpoint: string,
    data: any = null,
    options: any = {}
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`AcaPyService: Making ${method} request to ${url}`);

      if (!this.token) {
        console.warn('AcaPyService: No token set for request');
      } else {
        console.log(`AcaPyService: Using token: ${this.token.substring(0, 10)}...`);
      }

      const requestConfig: AxiosRequestConfig = {
        method: method.toUpperCase(),
        url,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      };

      if (data) {
        requestConfig.data = data;
      }

      const response: AxiosResponse = await axios(requestConfig);
      const output = response.data;
      console.log("++++++++++++  Endpoint=", endpoint, "\ndata=", output?.results.length)
      return response.data;
    } catch (error) {
      console.error('AcaPyService: Request failed:', error);
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        console.error('AcaPyService: Response status:', axiosError.response.status);
        console.error('AcaPyService: Response data:', axiosError.response.data);
      }
      
      throw error;
    }
  }

  async getConnections(params: any = {}): Promise<any> {
    return this.request('GET', '/connections?descending=false&limit=5000&offset=0&order_by=id', null, { params });
  }

  async getConnection(connectionId: string): Promise<any> {
    return this.request('GET', `/connections/${connectionId}`);
  }

  async createInvitation(params: any = {}): Promise<any> {
    return this.request('POST', '/connections/create-invitation', null, { params });
  }

  async sendBasicMessage(connectionId: string, content: string): Promise<any> {
    console.log(`AcaPyService: Sending basic message to connection ${connectionId}`);
    const data = {
      content
    };
    return this.request('POST', `/connections/${connectionId}/send-message`, data);
  }

  async getCredentials(params: any = {}): Promise<any> {
    console.log('AcaPyService: Getting legacy credentials');
    return this.request('GET', '/credentials?limit=5000&offset=0&start=0', null, { params });
  }

  async getAllCredentials(params: any = {}): Promise<any> {
    try {
      console.log('AcaPyService: Getting all credentials (legacy and W3C)');
      
      const promises = [
        this.getCredentials(params).catch(err => {
          console.error('AcaPyService: Error getting legacy credentials:', err);
          return { results: [] };
        }),
      ];
      
      const [legacyCredentials] = await Promise.all(promises);
      
      return {
        credentials: legacyCredentials?.results || [],
        total: (legacyCredentials?.results?.length || 0)
      };
    } catch (error) {
      console.error('AcaPyService: Error getting all credentials:', error);
      throw error;
    }
  }

  async getCredentialDefinitions(params: any = {}): Promise<any> {
    return this.request('GET', '/credential-definitions/created', null, { params });
  }

  async getIssueCredentialRecords(params: any = {}): Promise<any> {
    return this.request('GET', '/issue-credential/records?limit=5000&offset=0&start=0', null, { params });
  }

  async getIssueCredentialV2Records(params: any = {}): Promise<any> {
    return this.request('GET', '/issue-credential-2.0/records?limit=5000&offset=0&start=0', null, { params });
  }

  async getAllIssuedCredentials(params: any = {}): Promise<any> {
    try {
      console.log('AcaPyService: Getting all issued credentials (v1 and v2)');
      
      const [v1Records, v2Records] = await Promise.all([
        this.getIssueCredentialRecords(params),
        this.getIssueCredentialV2Records(params)
      ]);
      
      return {
        v1: v1Records?.results || [],
        v2: v2Records?.results || [],
        total: (v1Records?.results?.length || 0) + (v2Records?.results?.length || 0)
      };
    } catch (error) {
      console.error('AcaPyService: Error getting all issued credentials:', error);
      throw error;
    }
  }
}

const acaPyService = new AcaPyService();

export default acaPyService;