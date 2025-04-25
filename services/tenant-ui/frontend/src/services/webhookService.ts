// Webhook API Service with authentication
const WEBHOOK_API_KEY = import.meta.env.WEBHOOK_API_KEY || '12356';

/**
 * Performs API calls to the webhook service with authentication
 */
export const webhookService = {
  // Get all workflows
  getWorkflows: async (webhookUrl: string) => {
    const response = await fetch(`${webhookUrl}/workflow/get-workflows`, {
      headers: { 'x-api-key': WEBHOOK_API_KEY },
    });
    if (!response.ok) throw new Error('Failed to fetch workflows');
    return response.json();
  },

  // Create a new workflow
  createWorkflow: async (webhookUrl: string, workflowData: any) => {
    const response = await fetch(`${webhookUrl}/workflow/set-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': WEBHOOK_API_KEY,
      },
      body: JSON.stringify(workflowData),
    });
    if (!response.ok) throw new Error('Failed to create workflow');
    return response.json();
  },

  // Update an existing workflow
  updateWorkflow: async (webhookUrl: string, workflowData: any) => {
    const response = await fetch(`${webhookUrl}/workflow/update-workflow`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': WEBHOOK_API_KEY,
      },
      body: JSON.stringify(workflowData),
    });
    if (!response.ok) throw new Error('Failed to update workflow');
    return response.json();
  },
};

export default webhookService;
