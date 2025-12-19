import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ activeTab, setActiveTab, onLogout, children }) => {
  return (
    <div className="d-flex vh-100 bg-light overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />

      <div className="flex-grow-1 d-flex flex-column">
        <Header />
        <main className="flex-grow-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

