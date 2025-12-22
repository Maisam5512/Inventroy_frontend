// src/hooks/useInvoices.js
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

const useInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Base URL
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Get auth token
  const getAuthToken = () => {
    return user?.token || user?.user?.token;
  };

  // Fetch all invoices
  const fetchInvoices = async () => {
    if (!getAuthToken()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/invoices`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      
      const data = await res.json();
      if (res.ok) {
        setInvoices(data);
      } else {
        toast.error(data.message || "Failed to fetch invoices");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Create invoice
  const createInvoice = async (invoiceData) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Invoice created successfully!");
        await fetchInvoices(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to create invoice");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error creating invoice");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get single invoice
  const getInvoiceById = async (id) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to fetch invoice");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error fetching invoice");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Mark as paid
  const markAsPaid = async (id) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/invoices/${id}/pay`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Invoice marked as paid and stock updated!");
        await fetchInvoices(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to mark as paid");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error marking invoice as paid");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cancel invoice
  const cancelInvoice = async (id) => {
    if (!getAuthToken()) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/invoices/${id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Invoice cancelled successfully!");
        await fetchInvoices(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to cancel invoice");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error cancelling invoice");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices on mount
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice,
    getInvoiceById,
    markAsPaid,
    cancelInvoice,
  };
};

export default useInvoices;