// hooks/useProducts.js
import { useState } from "react";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

export default function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get token from user object
  const getToken = () => {
    return user?.token || (user?.user ? user.user.token : null);
  };

  // Fetch all products
  const fetchProducts = async () => {
    const token = getToken();
    
    if (!token) {
      console.error("No token found");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/product`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Check if response is HTML (error page)
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Received non-JSON response:", text.substring(0, 100));
        throw new Error("Server returned an error page");
      }
      
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.message.includes("Server returned an error page")) {
        toast.error("API endpoint not found. Check backend routes.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new product
  const createProduct = async (productData) => {
    const token = getToken();
    
    if (!token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Product created successfully!");
        await fetchProducts(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to create product");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error creating product");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update product
  const updateProduct = async (id, productData) => {
    const token = getToken();
    
    if (!token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/product/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Product updated successfully!");
        await fetchProducts(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to update product");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete product (hard delete)
  const deleteProduct = async (id) => {
    const token = getToken();
    
    if (!token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/product/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Product permanently deleted!");
        await fetchProducts(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to delete product");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle product status (active/inactive)
  const toggleProductStatus = async (id) => {
    const token = getToken();
    
    if (!token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/product/${id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Product ${data.status === "active" ? "enabled" : "disabled"} successfully!`);
        await fetchProducts(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to toggle product status");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Error toggling product status");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update stock
  const updateStock = async (id, quantity) => {
    const token = getToken();
    
    if (!token) {
      toast.error("Authentication required");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/product/${id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("Stock updated successfully!");
        await fetchProducts(); // Refresh the list
        return { success: true, data };
      } else {
        toast.error(data.message || "Failed to update stock");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Error updating stock");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    updateStock,
  };
}