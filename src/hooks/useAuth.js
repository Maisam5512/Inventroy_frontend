import { useState, useEffect } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ------------------ REGISTER ------------------
  const registerUser = async (values) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      return { success: true, message: "Registration successful. Please login." };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ------------------ LOGIN ------------------
  const loginUser = async (values) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Save login
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ------------------ LOGOUT ------------------
  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, registerUser, loginUser, logoutUser };
}
