// hooks/useDashboard.js
import { useState } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

export default function useDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [topInsights, setTopInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard overview (staff + admin)
  const fetchDashboard = async () => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/overview`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setDashboardData(data);
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to fetch dashboard data");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Rebuild dashboard stats (admin only)
  const rebuildDashboard = async () => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/rebuild`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Dashboard stats rebuilt successfully!");
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to rebuild dashboard");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error rebuilding dashboard");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch profit-loss stats (admin only)
  const fetchProfitLoss = async () => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/profit-loss`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setProfitLoss(data);
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to fetch profit-loss data");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error fetching profit-loss data");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch top insights (admin only)
  const fetchTopInsights = async () => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/top-insights`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setTopInsights(data);
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to fetch top insights");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error fetching top insights");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    profitLoss,
    topInsights,
    loading,
    fetchDashboard,
    rebuildDashboard,
    fetchProfitLoss,
    fetchTopInsights,
  };
}