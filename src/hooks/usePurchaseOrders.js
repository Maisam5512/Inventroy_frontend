// // src/hooks/usePurchaseOrders.js
// import { useState, useEffect } from "react";
// import axios from "axios";
// import useAuth from "./useAuth";

// const usePurchaseOrders = () => {
//   const { user } = useAuth();
//   const [purchaseOrders, setPurchaseOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const api = axios.create({
//     baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
//   });

//   // Add token to requests
//   api.interceptors.request.use((config) => {
//     const token = user?.token || user?.user?.token;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   });

//   // Fetch all purchase orders
//   const fetchPurchaseOrders = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get("/purchaseOrders");
//       setPurchaseOrders(response.data);
//       setError(null);
//       return { success: true, data: response.data };
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Failed to fetch purchase orders";
//       setError(errorMessage);
//       return { success: false, message: errorMessage };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create purchase order (Admin only)
//   const createPurchaseOrder = async (orderData) => {
//     setLoading(true);
//     try {
//       const response = await api.post("/purchaseOrders", orderData);
//       setPurchaseOrders([response.data.purchaseOrder, ...purchaseOrders]);
//       setError(null);
//       return { success: true, data: response.data };
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Failed to create purchase order";
//       setError(errorMessage);
//       return { success: false, message: errorMessage };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get single purchase order
//   const getPurchaseOrderById = async (id) => {
//     setLoading(true);
//     try {
//       const response = await api.get(`/purchaseOrders/${id}`);
//       setError(null);
//       return { success: true, data: response.data };
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Failed to fetch purchase order";
//       setError(errorMessage);
//       return { success: false, message: errorMessage };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update purchase order (Admin only - pending orders)
//   const updatePurchaseOrder = async (id, orderData) => {
//     setLoading(true);
//     try {
//       const response = await api.put(`/purchaseOrders/${id}`, orderData);
//       // Update in local state
//       setPurchaseOrders(purchaseOrders.map(order => 
//         order._id === id ? response.data.order : order
//       ));
//       setError(null);
//       return { success: true, data: response.data };
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Failed to update purchase order";
//       setError(errorMessage);
//       return { success: false, message: errorMessage };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mark as delivered (Admin only)
//   const markAsDelivered = async (id) => {
//     setLoading(true);
//     try {
//       const response = await api.patch(`/purchaseOrders/${id}/deliver`);
//       // Update status in local state
//       setPurchaseOrders(purchaseOrders.map(order => 
//         order._id === id ? { ...order, status: "delivered", receivedAt: new Date() } : order
//       ));
//       setError(null);
//       return { success: true, data: response.data };
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Failed to mark as delivered";
//       setError(errorMessage);
//       return { success: false, message: errorMessage };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cancel purchase order (Admin only)
//   const cancelPurchaseOrder = async (id) => {
//     setLoading(true);
//     try {
//       const response = await api.patch(`/purchaseOrders/${id}/cancel`);
//       // Update status in local state
//       setPurchaseOrders(purchaseOrders.map(order => 
//         order._id === id ? { ...order, status: "cancelled" } : order
//       ));
//       setError(null);
//       return { success: true, data: response.data };
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Failed to cancel purchase order";
//       setError(errorMessage);
//       return { success: false, message: errorMessage };
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       fetchPurchaseOrders();
//     }
//   }, [user]);

//   return {
//     purchaseOrders,
//     loading,
//     error,
//     fetchPurchaseOrders,
//     createPurchaseOrder,
//     getPurchaseOrderById,
//     updatePurchaseOrder,
//     markAsDelivered,
//     cancelPurchaseOrder,
//   };
// };

// export default usePurchaseOrders;










import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

const usePurchaseOrders = () => {
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Use hardcoded base URL instead of process.env
  const baseURL = "http://localhost:5000/api";

  // Get auth token
  const getAuthToken = () => {
    return user?.token || user?.user?.token;
  };

  // Fetch all purchase orders
  const fetchPurchaseOrders = async () => {
    if (!getAuthToken()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/purchaseOrders`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      
      const data = await res.json();
      if (res.ok) {
        setPurchaseOrders(data);
      } else {
        toast.error(data.message || "Failed to fetch purchase orders");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Create purchase order (Admin only)
  const createPurchaseOrder = async (orderData) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/purchaseOrders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Purchase order created successfully!");
        await fetchPurchaseOrders(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to create purchase order");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error creating purchase order");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get single purchase order
  const getPurchaseOrderById = async (id) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/purchaseOrders/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to fetch purchase order");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error fetching purchase order");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update purchase order (Admin only - pending orders)
  const updatePurchaseOrder = async (id, orderData) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/purchaseOrders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Purchase order updated successfully!");
        await fetchPurchaseOrders(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to update purchase order");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error updating purchase order");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Mark as delivered (Admin only)
  const markAsDelivered = async (id) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/purchaseOrders/${id}/deliver`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Order marked as delivered and stock updated!");
        await fetchPurchaseOrders(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to mark as delivered");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error marking order as delivered");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cancel purchase order (Admin only)
  const cancelPurchaseOrder = async (id) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/purchaseOrders/${id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Purchase order cancelled successfully!");
        await fetchPurchaseOrders(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to cancel purchase order");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error cancelling purchase order");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchase orders on mount
  useEffect(() => {
    if (user) {
      fetchPurchaseOrders();
    }
  }, [user]);

  return {
    purchaseOrders,
    loading,
    fetchPurchaseOrders,
    createPurchaseOrder,
    getPurchaseOrderById,
    updatePurchaseOrder,
    markAsDelivered,
    cancelPurchaseOrder,
  };
};

export default usePurchaseOrders;