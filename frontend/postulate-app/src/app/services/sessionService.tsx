

export const SessionService = {


  async sessionCreate (payload: any): Promise<any>  {
    try {
      const response = await fetch('http://localhost:5000/ps/session/create', {
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

    async sessionInit (payload: any): Promise<any>  {
        try {
          const response = await fetch('http://localhost:5000/api/session/session-init', {
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

      async useAlternatePath (payload: any): Promise<any>  {
        try {
          const response = await fetch('http://localhost:5000/api/session/use-alternative-path', {
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

      async getSessionByGuid(sessionId: string): Promise<any> {
        try {
          const response = await fetch(`http://localhost:5000/api/session/get-by-guid/${sessionId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch session by GUID');
          }
    
          return await response.json();
        } catch (error) {
          console.error('Error fetching session by GUID:', error);
          return {
            error: error instanceof Error ? error.message : 'Failed to fetch session by GUID',
          };
        }
      },

      async updateSession(payload: any): Promise<any> {
        try {
          const response = await fetch('http://localhost:5000/api/session/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update session');
          }
      
          return await response.json();
        } catch (error) {
          console.error('Error updating session:', error);
          return {
            error: error instanceof Error ? error.message : 'Failed to update session',
          };
        }
      },

      async getSessionListing (): Promise<any>  {
        try {
          const response = await fetch('http://localhost:5000/api/session/listing', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
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

      

      async getSessionConversationFlow (sessionId: string): Promise<any>  {
        try {
          const response = await fetch(`http://localhost:5000/api/session/conversation-flow/${sessionId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
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



}


