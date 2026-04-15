import { useState } from "react";
import axios from "axios";

export default function DecisionPanel() {
  const [paperId, setPaperId] = useState("");
  const [decision, setDecision] = useState("accept");

  const handleDecision = async () => {
    await axios.post(
      "http://localhost:5000/api/admin/decision",
      { paperId, decision },
      { headers: { Authorization: localStorage.getItem("token") } }
    );
  };

  return (
    <div>
      <h2>Admin Decision</h2>

      <input
        placeholder="Paper ID"
        onChange={(e) => setPaperId(e.target.value)}
      />

      <select onChange={(e) => setDecision(e.target.value)}>
        <option value="accept">Accept</option>
        <option value="reject">Reject</option>
      </select>

      <button onClick={handleDecision}>Submit</button>
    </div>
  );
}