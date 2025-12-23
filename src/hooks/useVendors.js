import { useState } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

export default function useVendors() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all vendors
  const fetchVendors = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendors`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      const data = await res.json();
      if (res.ok) {
        setVendors(data);
                console.log("The vendors", data);

      } else {
        toast.error(data.message || "Failed to fetch vendors");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Create new vendor
  const createVendor = async (vendorData) => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(vendorData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Vendor created successfully!");
        await fetchVendors(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to create vendor");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error creating vendor");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update vendor
  const updateVendor = async (id, vendorData) => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(vendorData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Vendor updated successfully!");
        await fetchVendors(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to update vendor");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error updating vendor");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete vendor (soft delete)
  const deleteVendor = async (id) => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/vendors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Vendor deactivated successfully!");
        await fetchVendors(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to delete vendor");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error deleting vendor");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    vendors,
    loading,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
  };
}