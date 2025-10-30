

export const CheckpointService = {

    async getCheckpointListBySessionId (sessionId: string): Promise<any>  {
        try {
          const response = await fetch(`http://localhost:5000/api/checkpoint/get-by-session-id/${sessionId}`, {
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
      }

}


