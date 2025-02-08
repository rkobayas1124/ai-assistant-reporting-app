//import { json } from "@remix-run/node";

import { useNavigate } from "@remix-run/react";
import { useState } from "react";

//import { json } from "@remix-run/react";


export default function Index() {
  const [resource, setResource] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setResource(e.target.value);
  };

  const handleSubmit = async(e) => {
    setStatus('connecting...');
    e.preventDefault();
    navigate(`/chatassistant?resource=${encodeURIComponent(resource)}`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          name="resource"
          value={resource}
          onChange={handleChange}
          placeholder="Data Resource"
        />
        <button type="submit"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
          marginLeft: "1%"
        }}
        >
          Connect
        </button>
        {status}
      </form>
    </div>
  );
}
