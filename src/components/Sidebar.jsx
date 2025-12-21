// Update src/components/Sidebar.jsx
import React from "react";

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
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
          <button
            className={`btn text-start d-flex align-items-center gap-2 ${
              activeTab === "dashboard"
                ? "btn-danger"
                : "btn-dark text-white-50"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <i className="bi bi-speedometer2"></i>
            Dashboard
          </button>

          <button
            className={`btn text-start d-flex align-items-center gap-2 ${
              activeTab === "inventory"
                ? "btn-danger"
                : "btn-dark text-white-50"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            <i className="bi bi-box-seam"></i>
            Inventory Items
          </button>

          <button
            className={`btn text-start d-flex align-items-center gap-2 ${
              activeTab === "purchase-orders"
                ? "btn-danger"
                : "btn-dark text-white-50"
            }`}
            onClick={() => setActiveTab("purchase-orders")}
          >
            <i className="bi bi-receipt"></i>
            Purchase Orders
          </button>

          <button
            className={`btn text-start d-flex align-items-center gap-2 ${
              activeTab === "invoices"
                ? "btn-danger"
                : "btn-dark text-white-50"
            }`}
            onClick={() => setActiveTab("invoices")}
          >
            <i className="bi bi-receipt-cutoff"></i>
            Invoices
          </button>

          {/* Added Stock Movements button */}
          <button
            className={`btn text-start d-flex align-items-center gap-2 ${
              activeTab === "stock-movements"
                ? "btn-danger"
                : "btn-dark text-white-50"
            }`}
            onClick={() => setActiveTab("stock-movements")}
          >
            <i className="bi bi-arrow-left-right"></i>
            Stock Movements
          </button>
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
            <button
              className={`btn text-start d-flex align-items-center gap-2 ${
                activeTab === "dashboard"
                  ? "btn-danger"
                  : "btn-dark text-white-50"
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("dashboard")}
            >
              <i className="bi bi-speedometer2"></i>
              Dashboard
            </button>

            <button
              className={`btn text-start d-flex align-items-center gap-2 ${
                activeTab === "inventory"
                  ? "btn-danger"
                  : "btn-dark text-white-50"
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("inventory")}
            >
              <i className="bi bi-box-seam"></i>
              Inventory Items
            </button>

            <button
              className={`btn text-start d-flex align-items-center gap-2 ${
                activeTab === "purchase-orders"
                  ? "btn-danger"
                  : "btn-dark text-white-50"
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("purchase-orders")}
            >
              <i className="bi bi-receipt"></i>
              Purchase Orders
            </button>

            <button
              className={`btn text-start d-flex align-items-center gap-2 ${
                activeTab === "invoices"
                  ? "btn-danger"
                  : "btn-dark text-white-50"
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("invoices")}
            >
              <i className="bi bi-receipt-cutoff"></i>
              Invoices
            </button>

            {/* Added Stock Movements button for mobile */}
            <button
              className={`btn text-start d-flex align-items-center gap-2 ${
                activeTab === "stock-movements"
                  ? "btn-danger"
                  : "btn-dark text-white-50"
              }`}
              data-bs-dismiss="offcanvas"
              onClick={() => setActiveTab("stock-movements")}
            >
              <i className="bi bi-arrow-left-right"></i>
              Stock Movements
            </button>
          </nav>

          <div className="mt-4 border-top border-secondary pt-3">
            <button
              className="btn btn-outline-light w-100 d-flex align-items-center gap-2"
              onClick={onLogout}
              data-bs-dismiss="offcanvas"
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



