import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useAuth from "../hooks/useAuth";

const Layout = () => {
  const { logoutUser, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/auth", { replace: true });
  };

  // If somehow user is null but we're in layout, redirect to auth
  if (!user) {
    return null; // Will be redirected by ProtectedRoute
  }

  return (
    <div className="d-flex vh-100 bg-light overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      
      <div className="flex-grow-1 d-flex flex-column">
        <Header />
        <main className="flex-grow-1 overflow-auto p-3">
          <Outlet /> {/* This renders the current page component */}
        </main>
      </div>
    </div>
  );
};

export default Layout;

