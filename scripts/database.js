// Database operations for face recognition
class DatabaseManager {
  constructor() {
    this.baseURL = window.location.origin;
  }

  // Register new face
  async registerFace(name, descriptor) {
    try {
      const response = await fetch(`${this.baseURL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          descriptor: Array.from(descriptor),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register face");
      }

      return data;
    } catch (error) {
      console.error("Error registering face:", error);
      throw error;
    }
  }

  // Get all registered faces
  async getAllFaces() {
    try {
      const response = await fetch(`${this.baseURL}/api/faces`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch faces");
      }

      return data.faces;
    } catch (error) {
      console.error("Error fetching faces:", error);
      throw error;
    }
  }

  // Get face descriptors for recognition
  async getFaceDescriptors() {
    try {
      const response = await fetch(`${this.baseURL}/api/descriptors`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch descriptors");
      }

      return data.faces;
    } catch (error) {
      console.error("Error fetching descriptors:", error);
      throw error;
    }
  }

  // Update recognition count
  async updateRecognition(name) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/recognize/${encodeURIComponent(name)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update recognition");
      }

      return data;
    } catch (error) {
      console.error("Error updating recognition:", error);
      throw error;
    }
  }

  // Delete face
  async deleteFace(name) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/faces/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete face");
      }

      return data;
    } catch (error) {
      console.error("Error deleting face:", error);
      throw error;
    }
  }

  // Get recognition history
  async getHistory() {
    try {
      const response = await fetch(`${this.baseURL}/api/history`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch history");
      }

      return data.history;
    } catch (error) {
      console.error("Error fetching history:", error);
      throw error;
    }
  }
}

// Create global instance
window.dbManager = new DatabaseManager();
