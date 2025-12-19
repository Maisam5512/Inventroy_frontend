import React from "react";

const Inventory = () => {
  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">All Items</h5>

        {/* Updated button to match red dashboard theme */}
        <button className="btn btn-danger fw-bold shadow-sm">
          + New Item
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light border-bottom">
              <tr className="small text-muted text-uppercase">
                <th className="ps-4 py-3">Name</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="ps-4 fw-bold text-danger">
                  Wireless Mouse M1
                </td>
                <td>SKU-1002</td>
                <td className="fw-bold">1,450</td>
                <td>10</td>
                <td>
                  <span className="badge bg-success-subtle text-success px-3">
                    Active
                  </span>
                </td>
                <td className="text-end pe-4">
                  <i className="bi bi-pencil-square text-primary me-3 action-icon"></i>
                  <i className="bi bi-trash3 text-danger action-icon"></i>
                </td>
              </tr>

              <tr>
                <td className="ps-4 fw-bold text-danger">
                  Ergonomic Keyboard
                </td>
                <td>SKU-1005</td>
                <td className="fw-bold text-danger">2</td>
                <td className="text-muted">15</td>
                <td>
                  <span className="badge bg-danger-subtle text-danger px-3">
                    Low Stock
                  </span>
                </td>
                <td className="text-end pe-4">
                  <i className="bi bi-pencil-square text-primary me-3 action-icon"></i>
                  <i className="bi bi-trash3 text-danger action-icon"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style>
        {`
          .table-hover tbody tr:hover {
            background-color: rgba(0,0,0,0.03);
          }
          .action-icon {
            cursor: pointer;
            transition: 0.2s;
            font-size: 1.2rem;
          }
          .action-icon:hover {
            transform: scale(1.15);
          }
        `}
      </style>
    </div>
  );
};

export default Inventory;

