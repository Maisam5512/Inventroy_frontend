import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useVendors from "../hooks/useVendors";
import useCategories from "../hooks/useCategories";
import useStaff from "../hooks/useStaff";
import useDashboard from "../hooks/useDashboard";
import VendorForm from "../components/VendorForm";
import CategoryForm from "../components/CategoryForm";
import StaffMemberForm from "../components/StaffMemberForm";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Extract user data from response
  const userData = user?.user || user;
  const userRole = userData?.role;
  
  const {
    vendors,
    loading: vendorsLoading,
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
  } = useVendors();
  
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const {
    staffMembers,
    loading: staffLoading,
    fetchStaffMembers,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
  } = useStaff();

  const {
    dashboardData,
    loading: dashboardLoading,
    fetchDashboard,
    rebuildDashboard,
    fetchProfitLoss,
    fetchTopInsights,
    profitLoss,
    topInsights,
  } = useDashboard();
  
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // State for edit items
  const [editingVendor, setEditingVendor] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  
  // State for delete confirmation
  const [deletingItem, setDeletingItem] = useState({ type: null, id: null, name: null });

  useEffect(() => {
    fetchDashboard();
    if (userRole === "admin") {
      fetchVendors();
      fetchCategories();
      fetchStaffMembers();
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === "admin" && activeTab === "profit-loss") {
      fetchProfitLoss();
    }
    if (userRole === "admin" && activeTab === "insights") {
      fetchTopInsights();
    }
  }, [activeTab, userRole]);

  const handleRebuildDashboard = async () => {
    await rebuildDashboard();
    fetchDashboard();
  };

  // Handle vendor form submission
  const handleVendorSubmit = async (values) => {
    if (editingVendor) {
      const result = await updateVendor(editingVendor._id, values);
      if (result.success) {
        setShowVendorForm(false);
        setEditingVendor(null);
        fetchDashboard(); // Refresh dashboard stats
      }
    } else {
      const result = await createVendor(values);
      if (result.success) {
        setShowVendorForm(false);
        fetchDashboard(); // Refresh dashboard stats
      }
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (values) => {
    if (editingCategory) {
      const result = await updateCategory(editingCategory._id, values);
      if (result.success) {
        setShowCategoryForm(false);
        setEditingCategory(null);
        fetchDashboard(); // Refresh dashboard stats
      }
    } else {
      const result = await createCategory(values);
      if (result.success) {
        setShowCategoryForm(false);
        fetchDashboard(); // Refresh dashboard stats
      }
    }
  };

  // Handle staff member form submission
  const handleStaffSubmit = async (values) => {
    if (editingStaff) {
      const result = await updateStaffMember(editingStaff._id, values);
      if (result.success) {
        setShowStaffForm(false);
        setEditingStaff(null);
        fetchDashboard(); // Refresh dashboard stats
      }
    } else {
      const result = await addStaffMember(values);
      if (result.success) {
        setShowStaffForm(false);
        fetchDashboard(); // Refresh dashboard stats
      }
    }
  };

  // Handle edit vendor
  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setShowVendorForm(true);
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  // Handle edit staff
  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setShowStaffForm(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (type, id, name) => {
    setDeletingItem({ type, id, name });
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    const { type, id } = deletingItem;
    
    try {
      let result;
      switch (type) {
        case 'vendor':
          result = await deleteVendor(id);
          break;
        case 'category':
          result = await deleteCategory(id);
          break;
        case 'staff':
          result = await deleteStaffMember(id);
          break;
        default:
          return;
      }
      
      if (result.success) {
        fetchDashboard(); // Refresh dashboard stats
        setDeletingItem({ type: null, id: null, name: null });
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Reset forms when closed
  const handleVendorFormClose = () => {
    setShowVendorForm(false);
    setEditingVendor(null);
  };

  const handleCategoryFormClose = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleStaffFormClose = () => {
    setShowStaffForm(false);
    setEditingStaff(null);
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format large numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const statsCards = [
    {
      label: "Total Products",
      value: dashboardData?.totalProducts || 0,
      icon: "bi-box-seam",
      color: "primary",
      subLabel: `${dashboardData?.activeProducts || 0} Active`,
    },
    {
      label: "Total Stock",
      value: formatNumber(dashboardData?.totalStockQuantity || 0),
      icon: "bi-archive",
      color: "success",
      subLabel: `${dashboardData?.lowStockCount || 0} Low Stock`,
    },
    {
      label: "Inventory Value",
      value: formatCurrency(dashboardData?.totalInventoryValue || 0),
      icon: "bi-cash-stack",
      color: "info",
      subLabel: "Current Value",
    },
    {
      label: "Total Sales",
      value: formatCurrency(dashboardData?.totalSalesAmount || 0),
      icon: "bi-graph-up",
      color: "warning",
      subLabel: `${dashboardData?.totalOrders || 0} Orders`,
    },
  ];

  const adminStatsCards = [
    {
      label: "Total Profit",
      value: formatCurrency(dashboardData?.totalProfit || 0),
      icon: "bi-currency-rupee",
      color: "success",
      subLabel: `Revenue: ${formatCurrency(dashboardData?.totalSalesAmount || 0)}`,
    },
    {
      label: "Total Cost",
      value: formatCurrency(dashboardData?.totalCost || 0),
      icon: "bi-cash",
      color: "danger",
      subLabel: "Total Expenses",
    },
    {
      label: "Pending Invoices",
      value: dashboardData?.pendingInvoices || 0,
      icon: "bi-receipt",
      color: "warning",
      subLabel: "Awaiting Payment",
    },
    {
      label: "Stock to Receive",
      value: dashboardData?.stockToBeReceived || 0,
      icon: "bi-truck",
      color: "info",
      subLabel: "Pending Orders",
    },
  ];

  if (dashboardLoading) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 py-md-4 bg-light min-vh-100">
      {/* HEADER WITH ACTIONS - MOBILE OPTIMIZED */}
      <div className="row align-items-center mb-3 mb-md-4">
        <div className="col-12 col-md-6">
          <h5 className="fw-bold mb-2 mb-md-0">Dashboard Overview</h5>
          <p className="text-muted small mb-0">
            Last updated: {new Date(dashboardData?.updatedAt || Date.now()).toLocaleString()}
          </p>
        </div>
        
        <div className="col-12 col-md-6">
          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
            {/* Admin Rebuild Button */}
            {userRole === "admin" && (
              <button
                className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
                onClick={handleRebuildDashboard}
                title="Rebuild Dashboard Stats"
                disabled={dashboardLoading}
              >
                <i className="bi bi-arrow-clockwise"></i>
                <span className="d-none d-md-inline">Rebuild Stats</span>
              </button>
            )}
            
            {userRole === "admin" && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (ADMIN ONLY) */}
      {userRole === "admin" && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-2">
                <div className="nav nav-pills nav-fill">
                  <button
                    className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Overview
                  </button>
                  <button
                    className={`nav-link ${activeTab === "profit-loss" ? "active" : ""}`}
                    onClick={() => setActiveTab("profit-loss")}
                  >
                    <i className="bi bi-graph-up-arrow me-2"></i>
                    Profit & Loss
                  </button>
                  <button
                    className={`nav-link ${activeTab === "insights" ? "active" : ""}`}
                    onClick={() => setActiveTab("insights")}
                  >
                    <i className="bi bi-trophy me-2"></i>
                    Top Insights
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT BASED ON ACTIVE TAB */}
      {activeTab === "overview" ? (
        <>
          {/* MAIN STATS CARDS - MOBILE OPTIMIZED */}
          <div className="row g-2 g-md-3 mb-3 mb-md-4">
            {statsCards.map((item, i) => (
              <div key={i} className="col-6 col-lg-3">
                <div className={`card border-0 shadow-sm dashboard-card border-top border-${item.color} border-4 h-100`}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className={`bg-${item.color}-subtle p-2 rounded-circle me-3`}>
                        <i className={`bi ${item.icon} text-${item.color} fs-5`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h2 className={`fw-bold text-${item.color} mb-0`}>{item.value}</h2>
                        <div className="small text-muted fw-bold text-uppercase">{item.label}</div>
                      </div>
                    </div>
                    <div className="small text-muted mt-2">{item.subLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADMIN SPECIFIC STATS */}
          {userRole === "admin" && (
            <div className="row g-2 g-md-3 mb-4">
              {adminStatsCards.map((item, i) => (
                <div key={i} className="col-6 col-lg-3">
                  <div className={`card border-0 shadow-sm dashboard-card border-top border-${item.color} border-4 h-100`}>
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className={`bg-${item.color}-subtle p-2 rounded-circle me-3`}>
                          <i className={`bi ${item.icon} text-${item.color} fs-5`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h2 className={`fw-bold text-${item.color} mb-0`}>{item.value}</h2>
                          <div className="small text-muted fw-bold text-uppercase">{item.label}</div>
                        </div>
                      </div>
                      <div className="small text-muted mt-2">{item.subLabel}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CATEGORY & STAFF SUMMARY */}
          <div className="row g-3 g-md-4 mb-4">
            {/* Categories Summary */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3 p-md-4">
                  <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                    <i className="bi bi-diagram-3 me-2"></i>Categories & Vendors
                  </h6>
                  
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="p-3">
                        <h2 className="fw-bold text-primary mb-1">{dashboardData?.totalCategories || 0}</h2>
                        <div className="small text-muted">Total Categories</div>
                        <div className="progress mt-2" style={{height: "6px"}}>
                          <div 
                            className="progress-bar bg-primary" 
                            role="progressbar" 
                            style={{width: "100%"}}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3">
                        <h2 className="fw-bold text-success mb-1">{dashboardData?.totalVendors || 0}</h2>
                        <div className="small text-muted">Total Vendors</div>
                        <div className="progress mt-2" style={{height: "6px"}}>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{width: "100%"}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Summary */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3 p-md-4">
                  <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                    <i className="bi bi-people me-2"></i>Staff Summary
                  </h6>
                  
                  <div className="text-center p-3">
                    <h2 className="fw-bold text-info mb-1">{dashboardData?.totalStaff || 0}</h2>
                    <div className="small text-muted">Total Staff Members</div>
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <div>
                        <span className="badge bg-primary">Admin: 1</span>
                      </div>
                      <div>
                        <span className="badge bg-secondary">Staff: {Math.max(0, (dashboardData?.totalStaff || 0) - 1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ADMIN ONLY SECTIONS */}
          {userRole === "admin" && dashboardData && (
            <div className="row g-3 g-md-4 mb-4">
              {/* Top Selling Product */}
              {dashboardData.topSellingProduct && (
                <div className="col-12 col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3 p-md-4">
                      <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                        <i className="bi bi-trophy me-2"></i>Top Selling Product
                      </h6>
                      <div className="d-flex align-items-center">
                        <div className="bg-warning-subtle p-3 rounded-circle me-3">
                          <i className="bi bi-star-fill text-warning fs-4"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">{dashboardData.topSellingProduct.product?.name || "N/A"}</h5>
                          <p className="text-muted small mb-1">SKU: {dashboardData.topSellingProduct.product?.sku || "N/A"}</p>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-warning me-2">
                              {dashboardData.topSellingProduct.quantity || 0} units sold
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Vendor */}
              {dashboardData.topVendor && (
                <div className="col-12 col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3 p-md-4">
                      <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                        <i className="bi bi-building me-2"></i>Top Vendor
                      </h6>
                      <div className="d-flex align-items-center">
                        <div className="bg-success-subtle p-3 rounded-circle me-3">
                          <i className="bi bi-award-fill text-success fs-4"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">{dashboardData.topVendor.vendor?.companyName || "N/A"}</h5>
                          <p className="text-muted small mb-1">{dashboardData.topVendor.vendor?.name || ""}</p>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-success me-2">
                              {formatCurrency(dashboardData.topVendor.totalPurchase || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Customer */}
              {dashboardData.topCustomer && (
                <div className="col-12 col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3 p-md-4">
                      <h6 className="fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">
                        <i className="bi bi-person-circle me-2"></i>Top Customer
                      </h6>
                      <div className="d-flex align-items-center">
                        <div className="bg-info-subtle p-3 rounded-circle me-3">
                          <i className="bi bi-person-badge-fill text-info fs-4"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">{dashboardData.topCustomer.customerName || "N/A"}</h5>
                          <p className="text-muted small mb-1">Best Customer</p>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-info me-2">
                              Spent: {formatCurrency(dashboardData.topCustomer.totalSpent || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : activeTab === "profit-loss" ? (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="fw-bold text-muted text-uppercase mb-4">
                  <i className="bi bi-graph-up-arrow me-2"></i>Profit & Loss Statement
                </h6>
                
                <div className="row text-center">
                  <div className="col-12 col-md-4 mb-4">
                    <div className="p-4 bg-success-subtle rounded-3">
                      <h2 className="fw-bold text-success mb-2">{formatCurrency(profitLoss?.revenue || 0)}</h2>
                      <div className="text-muted">Total Revenue</div>
                      <i className="bi bi-arrow-up-circle-fill text-success fs-1 mt-3"></i>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <div className="p-4 bg-danger-subtle rounded-3">
                      <h2 className="fw-bold text-danger mb-2">{formatCurrency(profitLoss?.cost || 0)}</h2>
                      <div className="text-muted">Total Cost</div>
                      <i className="bi bi-arrow-down-circle-fill text-danger fs-1 mt-3"></i>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <div className="p-4 bg-primary-subtle rounded-3">
                      <h2 className="fw-bold text-primary mb-2">{formatCurrency(profitLoss?.profit || 0)}</h2>
                      <div className="text-muted">Net Profit</div>
                      <i className="bi bi-cash-stack text-primary fs-1 mt-3"></i>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="progress" style={{height: "30px"}}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{width: `${profitLoss?.revenue ? (profitLoss.profit / profitLoss.revenue * 100) : 0}%`}}
                    >
                      Profit: {profitLoss?.profit ? ((profitLoss.profit / profitLoss.revenue) * 100).toFixed(1) : 0}%
                    </div>
                    <div 
                      className="progress-bar bg-danger" 
                      role="progressbar" 
                      style={{width: `${profitLoss?.revenue ? (profitLoss.cost / profitLoss.revenue * 100) : 0}%`}}
                    >
                      Cost: {profitLoss?.revenue ? ((profitLoss.cost / profitLoss.revenue) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "insights" ? (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="fw-bold text-muted text-uppercase mb-4">
                  <i className="bi bi-trophy me-2"></i>Top Insights
                </h6>
                
                <div className="row">
                  <div className="col-12 col-md-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="bg-warning-subtle p-3 rounded-circle d-inline-block mb-3">
                          <i className="bi bi-gem text-warning fs-1"></i>
                        </div>
                        <h5 className="fw-bold">Top Selling Product</h5>
                        <h4 className="fw-bold text-warning my-3">{topInsights?.topSellingProduct?.product?.name || "N/A"}</h4>
                        <p className="text-muted">Sold {topInsights?.topSellingProduct?.quantity || 0} units</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="bg-success-subtle p-3 rounded-circle d-inline-block mb-3">
                          <i className="bi bi-building text-success fs-1"></i>
                        </div>
                        <h5 className="fw-bold">Top Vendor</h5>
                        <h4 className="fw-bold text-success my-3">{topInsights?.topVendor?.vendor?.companyName || "N/A"}</h4>
                        <p className="text-muted">Purchases: {formatCurrency(topInsights?.topVendor?.totalPurchase || 0)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="bg-info-subtle p-3 rounded-circle d-inline-block mb-3">
                          <i className="bi bi-person-badge text-info fs-1"></i>
                        </div>
                        <h5 className="fw-bold">Top Customer</h5>
                        <h4 className="fw-bold text-info my-3">{topInsights?.topCustomer?.customerName || "N/A"}</h4>
                        <p className="text-muted">Spent: {formatCurrency(topInsights?.topCustomer?.totalSpent || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Admin Only Lists */}
      {userRole === "admin" && (
        <div className="row g-3 g-md-4 mt-3">
          {/* Vendors List */}
          <div className="col-12 col-md-4">
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
                        <th className="small text-muted text-end">Actions</th>
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
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleEditVendor(vendor)}
                                title="Edit Vendor"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteClick('vendor', vendor._id, vendor.name)}
                                title="Delete Vendor"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {vendors.length === 0 && !vendorsLoading && (
                        <tr>
                          <td colSpan="4" className="text-center small text-muted py-3">
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
          <div className="col-12 col-md-4">
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
                        <th className="small text-muted text-end">Actions</th>
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
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleEditCategory(category)}
                                title="Edit Category"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteClick('category', category._id, category.name)}
                                title="Delete Category"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {categories.length === 0 && !categoriesLoading && (
                        <tr>
                          <td colSpan="3" className="text-center small text-muted py-3">
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
          <div className="col-12 col-md-4">
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
                        <th className="small text-muted text-end">Actions</th>
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
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleEditStaff(member)}
                                title="Edit Staff Member"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteClick('staff', member._id, member.name)}
                                title="Delete Staff Member"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {staffMembers.length === 0 && !staffLoading && (
                        <tr>
                          <td colSpan="3" className="text-center small text-muted py-3">
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
          onClose={handleVendorFormClose}
          loading={vendorsLoading}
          initialData={editingVendor}
          isEditing={!!editingVendor}
        />
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          onSubmit={handleCategorySubmit}
          onClose={handleCategoryFormClose}
          loading={categoriesLoading}
          initialData={editingCategory}
          isEditing={!!editingCategory}
        />
      )}

      {/* Staff Member Form Modal */}
      {showStaffForm && (
        <StaffMemberForm
          onSubmit={handleStaffSubmit}
          onClose={handleStaffFormClose}
          loading={staffLoading}
          initialData={editingStaff}
          isEditing={!!editingStaff}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem.type && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeletingItem({ type: null, id: null, name: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <strong>{deletingItem.name}</strong>?
                  <br />
                  <small className="text-muted">This action cannot be undone.</small>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeletingItem({ type: null, id: null, name: null })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={vendorsLoading || categoriesLoading || staffLoading}
                >
                  {vendorsLoading || categoriesLoading || staffLoading ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;




