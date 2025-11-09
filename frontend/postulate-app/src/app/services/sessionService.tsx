

export const SessionService = {
  async sessionCreate (payload: any): Promise<any>  {
    try {
      const response = await fetch('http://localhost:8000/ps/session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      };
    }
  },

  async getSessionsByUser (userGuid: string): Promise<any>  {
    try {
      const response = await fetch(`http://localhost:8000/ps/session/listing/${userGuid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve sessions');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error retrieving sessions:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to retrieve sessions' 
      };
    }
  },

}


