export async function runQuery(query) {
    const response = await fetch("http://localhost:4000/runQuery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query}),
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to create query");
    }
    return data.data;
  }
  