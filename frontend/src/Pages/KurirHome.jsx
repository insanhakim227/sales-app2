import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../Context/AuthContext";

export const KurirHome = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/auth/dashboard");
        setDashboardData(res.data);
      } catch (err) {
        // handle error
      }
    };
    fetchDashboard();
  }, []);

 return (
  <div>
    {dashboardData && dashboardData.message && (
      <div className="text-center text-green-600 font-semibold mt-4">
        {dashboardData.message}
      </div>
    )}
  </div>
);
};