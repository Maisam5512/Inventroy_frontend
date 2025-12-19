// import useAuth from "./hooks/useAuth";
// import Auth from "./pages/Auth";
// import Dashboard from "./pages/Dashboard";
// import Inventory from "./pages/Inventory";
// import Layout from "./components/Layout";

// function App() {
//   const { user, logoutUser } = useAuth();
//   const [activeTab, setActiveTab] = useState("dashboard");

//   // If NOT logged in → show Auth page
//   if (!user) {
//     return <Auth />;
//   }

//   // If logged in → show Dashboard layout
//   return (
//     <Layout
//       activeTab={activeTab}
//       setActiveTab={setActiveTab}
//       onLogout={logoutUser}
//     >
//       {activeTab === "dashboard" ? <Dashboard /> : <Inventory />}
//     </Layout>
//   );
// }

// export default App;


import React, { useState } from "react";
import useAuth from "./hooks/useAuth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Layout from "./components/Layout";

function App() {
  const { user, logoutUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // If NOT logged in → show Auth page
  if (!user) {
    return <Auth />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={logoutUser}
    >
      {activeTab === "dashboard" ? <Dashboard /> : <Inventory />}
    </Layout>
  );
}

export default App;

