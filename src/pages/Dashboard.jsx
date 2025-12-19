import React from "react";

const Dashboard = () => {
  const stats = [
    { label: "To Be Packed", value: "228", color: "primary" },
    { label: "To Be Shipped", value: "6", color: "danger" },
    { label: "To Be Delivered", value: "10", color: "success" },
    { label: "To Be Invoiced", value: "474", color: "secondary" },
  ];

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <h5 className="fw-bold mb-4">Dashboard Overview</h5>

      {/* SALES ACTIVITY */}
      <div className="row g-3 mb-4">
        {stats.map((item, i) => (
          <div key={i} className="col-6 col-md-3">
            <div
              className={`card border-0 shadow-sm dashboard-card border-top border-${item.color} border-4 h-100`}
            >
              <div className="card-body text-center">
                <h2 className={`fw-light text-${item.color}`}>
                  {item.value}
                </h2>
                <div className="small text-muted fw-bold text-uppercase mt-2">
                  {item.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* PRODUCT DETAILS */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                <i className="bi bi-box-seam me-2"></i>Product Details
              </h6>

              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="small text-danger fw-bold">
                  Low Stock Items
                </span>
                <span className="fw-bold text-danger">3</span>
              </div>

              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="small">All Items</span>
                <span className="fw-bold">190</span>
              </div>

              <div className="d-flex justify-content-between py-2">
                <span className="small">Active Items</span>
                <span className="fw-bold text-success">71%</span>
              </div>
            </div>
          </div>
        </div>

        {/* INVENTORY SUMMARY */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                <i className="bi bi-archive me-2"></i>Inventory Summary
              </h6>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="small text-muted">Quantity in Hand</span>
                <span className="h4 fw-bold mb-0">10,458</span>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Quantity to be Received
                </span>
                <span className="h4 fw-bold mb-0">168</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Dashboard;





