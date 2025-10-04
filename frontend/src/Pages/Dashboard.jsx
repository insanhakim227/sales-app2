// ...existing imports...
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import DashboardAdmin from "./DashboardAdmin.jsx";
import DashboardSuperAdmin from "./DashboardSuperAdmin.jsx";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (user?.role === "SUPERADMIN") {
    return <DashboardSuperAdmin />;
  }
  // Default: admin
  return <DashboardAdmin />;
}