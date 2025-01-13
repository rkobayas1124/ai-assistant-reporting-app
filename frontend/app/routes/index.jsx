import { useState } from "react";
import { executeQuery } from "~/utils/runQuery";

export default function Index() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleExecute = async () => {
    try {
      const data = await executeQuery(query);
      setResult(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>SQL Executor</h1>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={5}
        cols={50}
        placeholder="Enter your SQL query here..."
      />
      <button onClick={handleExecute}>Execute</button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {result && (
        <div>
          <h2>Results</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
