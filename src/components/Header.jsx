import React from "react";
import useAuth from "../hooks/useAuth";

const Header = () => {
  const { user } = useAuth();
  
  // Extract user data
  const userData = user?.user || user;
  const userName = userData?.name || "User";
  const userRole = userData?.role || "Staff";
  
  // Format role
  const formattedRole = userRole === "admin" ? "Administrator" : "Staff Member";
  const roleBadgeColor = userRole === "admin" ? "danger" : "primary";

  return (
    <header className="bg-white border-bottom p-3 d-flex align-items-center justify-content-between shadow-sm">
      {/* Left: Mobile Menu & Brand */}
      <div className="d-flex align-items-center gap-3">
        {/* Mobile Menu */}
        <button
          className="btn btn-outline-danger d-md-none"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-4"></i>
        </button>

        {/* Brand */}
        <div className="d-flex align-items-center gap-2">
          <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center" 
               style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-box-seam-fill text-white"></i>
          </div>
          <span className="fw-bold text-dark d-none d-md-block">Stockly Inventory</span>
          <span className="fw-bold text-dark d-block d-md-none">Stockly</span>
        </div>
      </div>

      {/* Right: User Info */}
      <div className="d-flex align-items-center gap-3">
        {/* User Info */}
        <div className="d-flex align-items-center gap-2">
          <div className="text-end d-none d-md-block">
            <div className="fw-bold text-dark">{userName}</div>
            <div className="small text-muted">{formattedRole}</div>
          </div>
          
          {/* User Avatar */}
          <div className={`bg-${roleBadgeColor}-subtle text-${roleBadgeColor} rounded-circle d-flex align-items-center justify-content-center`} 
               style={{ width: '40px', height: '40px' }}>
            <span className="fw-bold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Mobile User Name */}
          <div className="d-block d-md-none">
            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{userName}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

