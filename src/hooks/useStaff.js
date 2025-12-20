import { useState } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

export default function useStaff() {
  const { user } = useAuth();
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all staff members (users)
  const fetchStaffMembers = async () => {
    const token = user?.token || (user?.user ? user.user.token : null);
    
    if (!token) {
      console.error("No token found");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (res.ok) {
        setStaffMembers(data);
      } else {
        toast.error(data.message || "Failed to fetch staff members");
      }
    } catch (error) {
      console.error("Error fetching staff members:", error);
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Add new staff member
  const addStaffMember = async (staffData) => {
    const token = user?.token || (user?.user ? user.user.token : null);
    
    if (!token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(staffData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Staff member added successfully!");
        await fetchStaffMembers(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to add staff member");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error adding staff member");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    staffMembers,
    loading,
    fetchStaffMembers,
    addStaffMember,
  };
}