// // src/hooks/useStockMovements.js
// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import useAuth from "./useAuth";

// const useStockMovements = () => {
//   const { user } = useAuth();
//   const [stockMovements, setStockMovements] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [reportData, setReportData] = useState(null);
//   const [profitLossData, setProfitLossData] = useState(null);
  
//   // Base URL
//   const baseURL = "http://localhost:5000/api";

//   // Get auth token
//   const getAuthToken = () => {
//     return user?.token || user?.user?.token;
//   };

//   // Fetch all stock movements
//   const fetchStockMovements = async () => {
//     if (!getAuthToken()) return;
    
//     setLoading(true);
//     try {
//       const res = await fetch(`${baseURL}/stockMovements`, {
//         headers: {
//           Authorization: `Bearer ${getAuthToken()}`,
//         },
//       });
      
//       const data = await res.json();
//       if (res.ok) {
//         setStockMovements(data);
//       } else {
//         toast.error(data.message || "Failed to fetch stock movements");
//       }
//     } catch (error) {
//       toast.error("Network error. Please check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Manual stock adjustment
//   const manualAdjustment = async (adjustmentData) => {
//     if (!getAuthToken()) {
//       toast.error("Authentication required");
//       return { success: false };
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${baseURL}/stockMovements/adjust`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${getAuthToken()}`,
//         },
//         body: JSON.stringify(adjustmentData),
//       });

//       const data = await res.json();
      
//       if (res.ok) {
//         toast.success("Stock adjusted successfully!");
//         await fetchStockMovements(); // Refresh the list
//         return { success: true, data };
//       } else {
//         toast.error(data.message || "Failed to adjust stock");
//         return { success: false, message: data.message };
//       }
//     } catch (error) {
//       toast.error("Error adjusting stock");
//       return { success: false, message: error.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get product movements
//   const getProductMovements = async (productId) => {
//     if (!getAuthToken()) {
//       toast.error("Authentication required");
//       return { success: false };
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${baseURL}/stockMovements/${productId}`, {
//         headers: {
//           Authorization: `Bearer ${getAuthToken()}`,
//         },
//       });

//       const data = await res.json();
      
//       if (res.ok) {
//         return { success: true, data };
//       } else {
//         toast.error(data.message || "Failed to fetch product movements");
//         return { success: false, message: data.message };
//       }
//     } catch (error) {
//       toast.error("Error fetching product movements");
//       return { success: false, message: error.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get stock report
//   const getStockReport = async (startDate, endDate) => {
//     if (!getAuthToken()) {
//       toast.error("Authentication required");
//       return { success: false };
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${baseURL}/stockMovements/report/stock?startDate=${startDate}&endDate=${endDate}`,
//         {
//           headers: {
//             Authorization: `Bearer ${getAuthToken()}`,
//           },
//         }
//       );

//       const data = await res.json();
      
//       if (res.ok) {
//         setReportData(data);
//         return { success: true, data };
//       } else {
//         toast.error(data.message || "Failed to generate stock report");
//         return { success: false, message: data.message };
//       }
//     } catch (error) {
//       toast.error("Error generating stock report");
//       return { success: false, message: error.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get profit loss report
//   const getProfitLossReport = async () => {
//     if (!getAuthToken()) {
//       toast.error("Authentication required");
//       return { success: false };
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${baseURL}/stockMovements/profit-loss`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${getAuthToken()}`,
//         },
//       });

//       const data = await res.json();
      
//       if (res.ok) {
//         setProfitLossData(data);
//         return { success: true, data };
//       } else {
//         toast.error(data.message || "Failed to generate profit/loss report");
//         return { success: false, message: data.message };
//       }
//     } catch (error) {
//       toast.error("Error generating profit/loss report");
//       return { success: false, message: error.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch stock movements on mount
//   useEffect(() => {
//     if (user) {
//       fetchStockMovements();
//     }
//   }, [user]);

//   return {
//     stockMovements,
//     loading,
//     reportData,
//     profitLossData,
//     fetchStockMovements,
//     manualAdjustment,
//     getProductMovements,
//     getStockReport,
//     getProfitLossReport,
//   };
// };

// export default useStockMovements;













// src/hooks/useStockMovements.js
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

const useStockMovements = () => {
  const { user } = useAuth();
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [profitLossData, setProfitLossData] = useState(null);
  
  // Base URL
  const baseURL = "http://localhost:5000/api";

  // Get auth token
  const getAuthToken = () => {
    return user?.token || user?.user?.token;
  };

  // Fetch all stock movements
  const fetchStockMovements = async () => {
    if (!getAuthToken()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/stockMovements`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      
      const data = await res.json();
      if (res.ok) {
        setStockMovements(data);
      } else {
        toast.error(data.message || "Failed to fetch stock movements");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Manual stock adjustment
  const manualAdjustment = async (adjustmentData) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/stockMovements/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(adjustmentData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Stock adjusted successfully!");
        await fetchStockMovements(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to adjust stock");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error adjusting stock");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get product movements
  const getProductMovements = async (productId) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/stockMovements/${productId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to fetch product movements");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error fetching product movements");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get stock report
  const getStockReport = async (startDate, endDate) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${baseURL}/stockMovements/report/stock?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const data = await res.json();
      
      if (res.ok) {
        setReportData(data);
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to generate stock report");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error generating stock report");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get profit loss report
  const getProfitLossReport = async () => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/stockMovements/profit-loss`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        setProfitLossData(data);
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to generate profit/loss report");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error generating profit/loss report");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear report data
  const clearReportData = () => {
    setReportData(null);
  };

  // Clear profit loss data
  const clearProfitLossData = () => {
    setProfitLossData(null);
  };

  // Fetch stock movements on mount
  useEffect(() => {
    if (user) {
      fetchStockMovements();
    }
  }, [user]);

  return {
    stockMovements,
    loading,
    reportData,
    profitLossData,
    setReportData, // Export the setter
    setProfitLossData, // Export the setter
    fetchStockMovements,
    manualAdjustment,
    getProductMovements,
    getStockReport,
    getProfitLossReport,
    clearReportData,
    clearProfitLossData,
  };
};

export default useStockMovements;