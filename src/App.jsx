// Update src/App.jsx
import React, { useState } from "react";
import useAuth from "./hooks/useAuth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import PurchaseOrders from "./pages/PurchaseOrders";
import Invoices from "./pages/Invoices";
import StockMovements from "./pages/StockMovements"; // New import
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";

function AppContent() {
  const { user, logoutUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {!user ? (
        <Auth />
      ) : (
        <Layout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={logoutUser}
        >
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "inventory" && <Inventory />}
          {activeTab === "purchase-orders" && <PurchaseOrders />}
          {activeTab === "invoices" && <Invoices />}
          {activeTab === "stock-movements" && <StockMovements />}
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




