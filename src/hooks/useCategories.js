import { useState } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

export default function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all categories
  const fetchCategories = async () => {
    if (!user?.token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const createCategory = async (categoryData) => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(categoryData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Category created successfully!");
        await fetchCategories(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to create category");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error creating category");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, categoryData) => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(categoryData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Category updated successfully!");
        await fetchCategories(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to update category");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error updating category");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete category (soft delete)
  const deleteCategory = async (id) => {
    if (!user?.token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Category deactivated successfully!");
        await fetchCategories(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to delete category");
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error("Error deleting category");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}