export const InferenceService = {

  async triggerPitfall(payload: { draft_paper: string; session_guid: string }): Promise<any> {
    const response = await fetch("http://localhost:8000/ps/agent/pitfall-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze draft");
    }

    return await response.json();
  },


  async searchCitation(payload: { query: string; session_guid: string }): Promise<any> {
    const response = await fetch("http://localhost:8000/ps/kg/citation-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze draft");
    }

    return await response.json();
  },

  async captureImpactPoints(payload: { draft_paper: string; session_guid: string }): Promise<any> {
    const response = await fetch("http://localhost:8000/ps/agent/significance-clarification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to capture impact points");
    }

    return await response.json();
  },

}