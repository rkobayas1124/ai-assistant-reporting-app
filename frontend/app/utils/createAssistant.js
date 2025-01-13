export async function createAssistant(table) {
    console.log(table);
    const response = await fetch("http://localhost:4000/createAssistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ table }),
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to execute query");
    }
    return data.data;
  }