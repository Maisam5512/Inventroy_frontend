import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items configuration
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/inventory", label: "Inventory Items", icon: "bi-box-seam" },
    { path: "/purchase-orders", label: "Purchase Orders", icon: "bi-receipt" },
    { path: "/invoices", label: "Invoices", icon: "bi-receipt-cutoff" },
    { path: "/stock-movements", label: "Stock Movements", icon: "bi-arrow-left-right" },
  ];

  const handleMobileNavClick = (path) => {
    navigate(path);
    // Close mobile sidebar
    const offcanvas = document.getElementById('mobileSidebar');
    const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(offcanvas);
    if (bsOffcanvas) {
      bsOffcanvas.hide();
    }
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className="d-none d-md-flex flex-column bg-dark text-white vh-100"
        style={{ width: "260px" }}
      >
        <div className="p-4 border-bottom border-secondary">
          <h4 className="fw-bold mb-0">Stockly</h4>
        </div>

        <nav className="nav flex-column p-3 gap-2 flex-grow-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `btn text-start d-flex align-items-center gap-2 ${
                  isActive ? "btn-danger" : "btn-dark text-white-50"
                }`
              }
              end={item.path === "/dashboard"}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-top border-secondary">
          <button
            className="btn btn-outline-light w-100 d-flex align-items-center gap-2"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE OFFCANVAS SIDEBAR */}
      <div
        className="offcanvas offcanvas-start d-md-none bg-dark text-white"
        tabIndex="-1"
        id="mobileSidebar"
      >
        <div className="offcanvas-header border-bottom border-secondary">
          <h5 className="offcanvas-title">Stockly</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body p-3">
          <nav className="nav flex-column gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`btn text-start d-flex align-items-center gap-2 ${
                  location.pathname === item.path ? "btn-danger" : "btn-dark text-white-50"
                }`}
                onClick={() => handleMobileNavClick(item.path)}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-4 border-top border-secondary pt-3">
            <button
              className="btn btn-outline-light w-100 d-flex align-items-center gap-2"
              onClick={() => {
                onLogout();
                const offcanvas = document.getElementById('mobileSidebar');
                const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(offcanvas);
                if (bsOffcanvas) bsOffcanvas.hide();
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;



