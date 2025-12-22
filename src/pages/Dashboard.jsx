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
    <div className="container-fluid py-3 py-md-4 bg-light min-vh-100">
      {/* HEADER WITH ACTIONS - MOBILE OPTIMIZED */}
      <div className="row align-items-center mb-3 mb-md-4">
        <div className="col-12 col-md-6">
          <h5 className="fw-bold mb-2 mb-md-0">Dashboard Overview</h5>
        </div>
        
        {userRole === "admin" && (
          <div className="col-12 col-md-6">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              {/* MOBILE: Icon-only buttons */}
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1 d-md-none"
                onClick={() => setShowVendorForm(true)}
                title="Add Vendor"
              >
                <i className="bi bi-person-plus fs-6"></i>
              </button>
              <button
                className="btn btn-success btn-sm d-flex align-items-center gap-1 d-md-none"
                onClick={() => setShowCategoryForm(true)}
                title="Add Category"
              >
                <i className="bi bi-folder-plus fs-6"></i>
              </button>
              <button
                className="btn btn-info btn-sm d-flex align-items-center gap-1 d-md-none"
                onClick={() => setShowStaffForm(true)}
                title="Add Staff Member"
              >
                <i className="bi bi-person-plus fs-6"></i>
              </button>
              
              {/* DESKTOP: Full text buttons */}
              <button
                className="btn btn-primary btn-sm d-none d-md-flex align-items-center gap-1"
                onClick={() => setShowVendorForm(true)}
              >
                <i className="bi bi-person-plus"></i> Add Vendor
              </button>
              <button
                className="btn btn-success btn-sm d-none d-md-flex align-items-center gap-1"
                onClick={() => setShowCategoryForm(true)}
              >
                <i className="bi bi-folder-plus"></i> Add Category
              </button>
              <button
                className="btn btn-info btn-sm d-none d-md-flex align-items-center gap-1"
                onClick={() => setShowStaffForm(true)}
              >
                <i className="bi bi-person-plus"></i> Add Member
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STATS CARDS - MOBILE OPTIMIZED */}
      <div className="row g-2 g-md-3 mb-3 mb-md-4">
        {stats.map((item, i) => (
          <div key={i} className="col-6 col-sm-3">
            <div
              className={`card border-0 shadow-sm dashboard-card border-top border-${item.color} border-4 h-100`}
            >
              <div className="card-body text-center p-2 p-md-3">
                <h2 className={`fw-light text-${item.color} mb-1 mb-md-2`}>
                  {item.value}
                </h2>
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>
                  {item.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT ROW */}
      <div className="row g-3 g-md-4">
        {/* PRODUCT DETAILS - MOBILE OPTIMIZED */}
        <div className="col-12 col-md-7 order-1 order-md-1">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3 p-md-4">
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

        {/* INVENTORY SUMMARY - MOBILE OPTIMIZED */}
        <div className="col-12 col-md-5 order-2 order-md-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3 p-md-4">
              <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                <i className="bi bi-archive me-2"></i>Inventory Summary
              </h6>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="small text-muted">Quantity in Hand</span>
                <span className="h5 h4-md fw-bold mb-0">10,458</span>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Quantity to be Received
                </span>
                <span className="h5 h4-md fw-bold mb-0">168</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Only Sections - MOBILE OPTIMIZED */}
      {userRole === "admin" && (
        <div className="row g-3 g-md-4 mt-3">
          {/* Vendors List */}
          <div className="col-12 col-md-4 order-3 order-md-1">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-muted text-uppercase mb-0">
                    <i className="bi bi-people me-2"></i>
                    Vendors ({vendors.length})
                  </h6>
                  {vendorsLoading && (
                    <span className="spinner-border spinner-border-sm"></span>
                  )}
                </div>
                <div className="table-responsive" style={{ maxHeight: "200px" }}>
                  <table className="table table-sm table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="small text-muted">Name</th>
                        <th className="small text-muted d-none d-sm-table-cell">Company</th>
                        <th className="small text-muted d-sm-none">Co.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.slice(0, 5).map((vendor) => (
                        <tr key={vendor._id}>
                          <td className="small text-truncate" style={{ maxWidth: "100px" }}>
                            {vendor.name}
                          </td>
                          <td className="small text-truncate d-none d-sm-table-cell" style={{ maxWidth: "120px" }}>
                            {vendor.companyName}
                          </td>
                          <td className="small text-truncate d-sm-none" style={{ maxWidth: "80px" }}>
                            {vendor.companyName}
                          </td>
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
          <div className="col-12 col-md-4 order-4 order-md-2">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-muted text-uppercase mb-0">
                    <i className="bi bi-tags me-2"></i>
                    Categories ({categories.length})
                  </h6>
                  {categoriesLoading && (
                    <span className="spinner-border spinner-border-sm"></span>
                  )}
                </div>
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
                          <td className="small text-truncate" style={{ maxWidth: "150px" }}>
                            {category.name}
                          </td>
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
          <div className="col-12 col-md-4 order-5 order-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-muted text-uppercase mb-0">
                    <i className="bi bi-person-badge me-2"></i>
                    Staff Members ({staffMembers.length})
                  </h6>
                  {staffLoading && (
                    <span className="spinner-border spinner-border-sm"></span>
                  )}
                </div>
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
                          <td className="small text-truncate" style={{ maxWidth: "150px" }}>
                            {member.name}
                          </td>
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





