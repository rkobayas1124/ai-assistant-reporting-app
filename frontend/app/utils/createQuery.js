export async function createQuery(message, table) {
    console.log(message);
    const response = await fetch("http://localhost:4000/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, table }),
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to execute query");
    }
    return data.data;
  }