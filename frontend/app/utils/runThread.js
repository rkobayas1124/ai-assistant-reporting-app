export async function runThread(message, assistantId, threadId) {
    console.log(message);
    const response = await fetch("http://localhost:4000/runThread", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, assistantId, threadId }),
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to execute query");
    }
    return data.data;
  }