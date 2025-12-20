import React, { useState } from "react";
import useAuth from "./hooks/useAuth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";

function AppContent() {
  const { user, logoutUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <>
      {/* ✅ Toast must always be mounted */}
      <ToastContainer position="top-right" autoClose={3000} />

      {!user ? (
        <Auth />
      ) : (
        <Layout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={logoutUser}
        >
          {activeTab === "dashboard" ? <Dashboard /> : <Inventory />}
        </Layout>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;




