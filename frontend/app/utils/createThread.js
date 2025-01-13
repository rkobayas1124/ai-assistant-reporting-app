export async function createThread() {
    const response = await fetch("http://localhost:4000/createThread", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to execute query");
    }
    return data.data;
  }