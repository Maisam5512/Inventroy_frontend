import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useVendors from "../hooks/useVendors";
import useCategories from "../hooks/useCategories";
import useStaff from "../hooks/useStaff";
import VendorForm from "../components/VendorForm";
import CategoryForm from "../components/CategoryForm";
import StaffMemberForm from "../components/StaffMemberForm";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Extract user data from response
  const userData = user?.user || user;
  const userRole = userData?.role;
  const userToken = user?.token || userData?.token;
  
  const {
    vendors,
    loading: vendorsLoading,
    fetchVendors,
    createVendor,
  } = useVendors();
  
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
    createCategory,
  } = useCategories();

  const {
    staffMembers,
    loading: staffLoading,
    fetchStaffMembers,
    addStaffMember,
  } = useStaff();
  
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);

  const stats = [
    { label: "To Be Packed", value: "228", color: "primary" },
    { label: "To Be Shipped", value: "6", color: "danger" },
    { label: "To Be Delivered", value: "10", color: "success" },
    { label: "To Be Invoiced", value: "474", color: "secondary" },
  ];

  useEffect(() => {
    if (userRole === "admin") {
      fetchVendors();
      fetchCategories();
      fetchStaffMembers();
    }
  }, [userRole]);

  // Handle vendor form submission
  const handleVendorSubmit = async (values) => {
    const result = await createVendor(values);
    if (result.success) {
      setShowVendorForm(false);
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (values) => {
    const result = await createCategory(values);
    if (result.success) {
      setShowCategoryForm(false);
    }
  };

  // Handle staff member form submission
  const handleStaffSubmit = async (values) => {
    const result = await addStaffMember(values);
    if (result.success) {
      setShowStaffForm(false);
    }
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Dashboard Overview</h5>
        {userRole === "admin" && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => setShowVendorForm(true)}
            >
              <i className="bi bi-person-plus"></i> Add Vendor
            </button>
            <button
              className="btn btn-success btn-sm d-flex align-items-center gap-1"
              onClick={() => setShowCategoryForm(true)}
            >
              <i className="bi bi-folder-plus"></i> Add Category
            </button>
            <button
              className="btn btn-info btn-sm d-flex align-items-center gap-1"
              onClick={() => setShowStaffForm(true)}
            >
              <i className="bi bi-person-plus"></i> Add Member
            </button>
          </div>
        )}
      </div>

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

      {/* Admin Only Sections */}
      {userRole === "admin" && (
        <div className="row g-4 mt-3">
          {/* Vendors List */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                  <i className="bi bi-people me-2"></i>
                  Vendors ({vendors.length})
                  {vendorsLoading && (
                    <span className="spinner-border spinner-border-sm ms-2"></span>
                  )}
                </h6>
                <div className="table-responsive" style={{ maxHeight: "200px" }}>
                  <table className="table table-sm table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="small text-muted">Name</th>
                        <th className="small text-muted">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.slice(0, 5).map((vendor) => (
                        <tr key={vendor._id}>
                          <td className="small">{vendor.name}</td>
                          <td className="small">{vendor.companyName}</td>
                        </tr>
                      ))}
                      {vendors.length === 0 && !vendorsLoading && (
                        <tr>
                          <td colSpan="2" className="text-center small text-muted py-3">
                            No vendors found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                  <i className="bi bi-tags me-2"></i>
                  Categories ({categories.length})
                  {categoriesLoading && (
                    <span className="spinner-border spinner-border-sm ms-2"></span>
                  )}
                </h6>
                <div className="table-responsive" style={{ maxHeight: "200px" }}>
                  <table className="table table-sm table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="small text-muted">Name</th>
                        <th className="small text-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.slice(0, 5).map((category) => (
                        <tr key={category._id}>
                          <td className="small">{category.name}</td>
                          <td className="small">
                            <span className={`badge bg-${category.status === "active" ? "success" : "secondary"}`}>
                              {category.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {categories.length === 0 && !categoriesLoading && (
                        <tr>
                          <td colSpan="2" className="text-center small text-muted py-3">
                            No categories found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Members List */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                  <i className="bi bi-person-badge me-2"></i>
                  Staff Members ({staffMembers.length})
                  {staffLoading && (
                    <span className="spinner-border spinner-border-sm ms-2"></span>
                  )}
                </h6>
                <div className="table-responsive" style={{ maxHeight: "200px" }}>
                  <table className="table table-sm table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="small text-muted">Name</th>
                        <th className="small text-muted">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffMembers.slice(0, 5).map((member) => (
                        <tr key={member._id}>
                          <td className="small">{member.name}</td>
                          <td className="small">
                            <span className={`badge bg-${member.role === "admin" ? "danger" : "primary"}`}>
                              {member.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {staffMembers.length === 0 && !staffLoading && (
                        <tr>
                          <td colSpan="2" className="text-center small text-muted py-3">
                            No staff members found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <VendorForm
          onSubmit={handleVendorSubmit}
          onClose={() => setShowVendorForm(false)}
          loading={vendorsLoading}
        />
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          onSubmit={handleCategorySubmit}
          onClose={() => setShowCategoryForm(false)}
          loading={categoriesLoading}
        />
      )}

      {/* Staff Member Form Modal */}
      {showStaffForm && (
        <StaffMemberForm
          onSubmit={handleStaffSubmit}
          onClose={() => setShowStaffForm(false)}
          loading={staffLoading}
        />
      )}
    </div>
  );
};

export default Dashboard;





