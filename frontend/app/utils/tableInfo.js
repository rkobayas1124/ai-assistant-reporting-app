export async function getTableInfo() {
    const response = await fetch("http://localhost:4000/tableInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to execute query");
    }
    return data.data;
  }