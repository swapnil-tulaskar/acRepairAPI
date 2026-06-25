import { useEffect, useState } from "react";
import { getMyRepairs } from "../../services/repair.service";

export default function UserDashboard() {
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    getMyRepairs().then(res => setRepairs(res.data));
  }, []);

  return (
    <div>
      <h2>User Dashboard</h2>

      {repairs.map(r => (
        <div key={r._id}>
          <p>{r.problem}</p>
          <p>Status: {r.status}</p>
        </div>
      ))}
    </div>
  );
}