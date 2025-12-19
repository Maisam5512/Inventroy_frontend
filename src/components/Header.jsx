import React from "react";

const Header = () => {
  return (
    <header className="bg-white border-bottom p-3 d-flex align-items-center justify-content-between shadow-sm">
      {/* MOBILE HAMBURGER */}
      <button
        className="btn btn-outline-danger d-md-none"
        data-bs-toggle="offcanvas"
        data-bs-target="#mobileSidebar"
      >
        <i className="bi bi-list fs-4"></i>
      </button>

      {/* DESKTOP SEARCH */}
      <div className="input-group w-50 d-none d-md-flex ms-3">
        <span className="input-group-text bg-light border-0">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control bg-light border-0"
          placeholder="Search..."
        />
      </div>

      <div className="d-flex align-items-center gap-3">
        <span className="fw-bold">Admin</span>
      </div>
    </header>
  );
};

export default Header;

