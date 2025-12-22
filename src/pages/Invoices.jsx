import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useInvoices from "../hooks/useInvoices";
import InvoiceForm from "../components/InvoiceForm";
import { toast } from "react-toastify";

const Invoices = () => {
  const { user } = useAuth();
  const {
    invoices,
    loading: invoicesLoading,
    fetchInvoices,
    createInvoice,
    markAsPaid,
    cancelInvoice,
  } = useInvoices();
  
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get user data
  const userData = user?.user || user;
  const userRole = userData?.role;

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    const matchesSearch = !searchQuery.trim() || 
      invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    // Payment method filter
    const matchesPayment = paymentMethodFilter === "all" || invoice.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Handle invoice form submission
  const handleInvoiceSubmit = async (values) => {
    try {
      // Prepare data for API
      const invoiceData = {
        ...values,
        products: values.products.map(item => ({
          product: item.product,
          quantity: Number(item.quantity),
          sellingPrice: Number(item.sellingPrice)
        }))
      };

      const result = await createInvoice(invoiceData);
      
      if (result.success) {
        toast.success("Invoice created successfully!");
        setShowInvoiceForm(false);
        fetchInvoices(); // Refresh the list
      } else {
        toast.error(result.message || "Failed to create invoice");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async (invoiceId, invoiceNumber) => {
    if (window.confirm(`Mark invoice ${invoiceNumber} as paid? This will deduct stock from inventory.`)) {
      const result = await markAsPaid(invoiceId);
      if (result.success) {
        toast.success("Invoice marked as paid and stock updated!");
      }
    }
  };

  // Handle cancel invoice
  const handleCancelInvoice = async (invoiceId, invoiceNumber) => {
    if (window.confirm(`Are you sure you want to cancel invoice ${invoiceNumber}?`)) {
      const result = await cancelInvoice(invoiceId);
      if (result.success) {
        toast.success("Invoice cancelled successfully!");
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "paid":
        return <span className="badge bg-success">Paid</span>;
      case "cancelled":
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Get payment method badge for desktop
  const getPaymentMethodBadge = (method) => {
    const methods = {
      cash: { color: "success", icon: "bi-cash", label: "Cash" },
      card: { color: "info", icon: "bi-credit-card", label: "Card" },
      bank: { color: "primary", icon: "bi-bank", label: "Bank" },
      wallet: { color: "warning", icon: "bi-wallet", label: "Wallet" },
    };
    
    const methodInfo = methods[method] || { color: "secondary", icon: "bi-question", label: method };
    
    return (
      <span className={`badge bg-${methodInfo.color} d-flex align-items-center gap-1`}>
        <i className={`bi ${methodInfo.icon}`}></i>
        {methodInfo.label}
      </span>
    );
  };

  // Get payment method badge for mobile (icon only)
  const getPaymentMethodBadgeMobile = (method) => {
    const methods = {
      cash: { color: "success", icon: "bi-cash" },
      card: { color: "info", icon: "bi-credit-card" },
      bank: { color: "primary", icon: "bi-bank" },
      wallet: { color: "warning", icon: "bi-wallet" },
    };
    
    const methodInfo = methods[method] || { color: "secondary", icon: "bi-question" };
    
    return (
      <span className={`badge bg-${methodInfo.color}`} title={method}>
        <i className={`bi ${methodInfo.icon}`}></i>
      </span>
    );
  };

  // Calculate statistics
  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === "pending").length,
    paid: invoices.filter(i => i.status === "paid").length,
    cancelled: invoices.filter(i => i.status === "cancelled").length,
    totalRevenue: invoices
      .filter(i => i.status === "paid")
      .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0),
  };

  // Format date for desktop
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date for mobile (shorter)
  const formatDateMobile = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format time for mobile
  const formatTimeMobile = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Mobile card component
  const InvoiceCard = ({ invoice }) => (
    <div className="card mb-3 border-0 shadow-sm">
      <div className="card-body">
        {/* Card Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="fw-bold mb-0">{invoice.invoiceNumber}</h6>
            <div className="small text-muted">
              {formatDateMobile(invoice.soldAt || invoice.createdAt)}
              {formatTimeMobile(invoice.soldAt || invoice.createdAt) && (
                <span className="ms-1">{formatTimeMobile(invoice.soldAt || invoice.createdAt)}</span>
              )}
            </div>
          </div>
          <div className="text-end">
            <div className="fw-bold text-danger">${invoice.totalAmount?.toFixed(2)}</div>
            <div className="small text-muted">{invoice.products?.length} items</div>
          </div>
        </div>

        {/* Customer and Payment */}
        <div className="row g-2 mb-2">
          <div className="col-8">
            <div className="small text-muted">Customer</div>
            <div className="fw-semibold">{invoice.customerName || "Walk-in Customer"}</div>
          </div>
          <div className="col-4 text-end">
            <div className="small text-muted">Payment</div>
            <div>{getPaymentMethodBadgeMobile(invoice.paymentMethod)}</div>
          </div>
        </div>

        {/* Products Preview */}
        <div className="mb-2">
          <div className="small text-muted">Products</div>
          <div className="small">
            {invoice.products?.slice(0, 2).map((item, idx) => (
              <div key={idx} className="mb-1">
                • {item.product?.name || `Product ${idx + 1}`} × {item.quantity}
              </div>
            ))}
            {invoice.products?.length > 2 && (
              <span className="text-muted">
                +{invoice.products.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="row g-2">
          <div className="col-6">
            <div className="small text-muted">Status</div>
            <div>{getStatusBadge(invoice.status)}</div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-end gap-2">
              {invoice.status === "pending" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleMarkAsPaid(invoice._id, invoice.invoiceNumber)}
                    title="Mark as Paid"
                    disabled={invoicesLoading}
                  >
                    <i className="bi bi-check-circle me-1"></i> Pay
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleCancelInvoice(invoice._id, invoice.invoiceNumber)}
                    title="Cancel Invoice"
                    disabled={invoicesLoading}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </>
              )}
              {invoice.status === "paid" && (
                <button className="btn btn-sm btn-success w-100" disabled>
                  <i className="bi bi-check-circle me-1"></i> Paid
                </button>
              )}
              {invoice.status === "cancelled" && (
                <button className="btn btn-sm btn-danger w-100" disabled>
                  <i className="bi bi-x-circle me-1"></i> Cancelled
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-3 py-md-4 bg-light min-vh-100">
      {/* MOBILE HEADER (Hidden on Desktop) */}
      <div className="row align-items-center mb-3 mb-md-0 d-md-none">
        <div className="col-12 mb-3">
          <h5 className="fw-bold mb-1">Sales Invoices</h5>
          <div className="small text-muted">
            Manage customer invoices and sales
          </div>
        </div>

        <div className="col-12">
          <div className="d-flex flex-column gap-2">
            {/* Search Row */}
            <div className="d-flex gap-2">
              <div className="input-group flex-grow-1">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                title="Filter options"
              >
                <i className="bi bi-funnel"></i>
                {(statusFilter !== "all" || paymentMethodFilter !== "all") && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    <span className="visually-hidden">Active filters</span>
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filters Dropdown */}
            {showMobileFilters && (
              <div className="card mb-2">
                <div className="card-body p-3">
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Status</label>
                      <select 
                        className="form-select form-select-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Payment Method</label>
                      <select 
                        className="form-select form-select-sm"
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      >
                        <option value="all">All Payments</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank</option>
                        <option value="wallet">Wallet</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <button
                        className="btn btn-sm btn-outline-secondary w-100 mt-2"
                        onClick={() => {
                          setStatusFilter("all");
                          setPaymentMethodFilter("all");
                          setShowMobileFilters(false);
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* New Invoice Button for Mobile */}
            <button 
              className="btn btn-danger fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowInvoiceForm(true)}
              disabled={invoicesLoading}
            >
              {invoicesLoading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>
                  <i className="bi bi-plus-circle"></i> New Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP HEADER (Hidden on Mobile) */}
      <div className="d-none d-md-flex justify-content-between align-items-start align-items-md-center mb-4">
        <div className="flex-shrink-0">
          <h5 className="fw-bold mb-1">Sales Invoices</h5>
          <div className="small text-muted">
            Manage customer invoices and sales
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
          {/* Search and Filters - WEB VIEW FIXED */}
          <div className="d-flex flex-wrap flex-md-nowrap gap-2" style={{ minWidth: "600px" }}>
            <div className="input-group flex-grow-1" style={{ minWidth: "250px", maxWidth: "400px" }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-secondary"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by invoice number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>

            <select 
              className="form-select flex-shrink-0" 
              style={{ width: "150px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select 
              className="form-select flex-shrink-0" 
              style={{ width: "160px" }}
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
              <option value="wallet">Digital Wallet</option>
            </select>
          </div>

          {/* New Invoice Button - WEB VIEW */}
          <button 
            className="btn btn-danger fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-shrink-0"
            onClick={() => setShowInvoiceForm(true)}
            style={{ minWidth: "150px", height: "38px" }}
            disabled={invoicesLoading}
          >
            {invoicesLoading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <>
                <i className="bi bi-plus-circle"></i> New Invoice
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards - Responsive */}
      <div className="row g-2 g-md-3 mb-3 mb-md-4">
        {[
          { label: "Total Invoices", value: stats.total, color: "primary", icon: "bi-receipt" },
          { label: "Pending", value: stats.pending, color: "warning", icon: "bi-clock" },
          { label: "Paid", value: stats.paid, color: "success", icon: "bi-check-circle" },
          { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, color: "danger", icon: "bi-currency-dollar" },
        ].map((stat, i) => (
          <div key={i} className="col-6 col-sm-3">
            <div className={`card border-0 shadow-sm dashboard-card border-top border-${stat.color} border-4 h-100`}>
              <div className="card-body text-center p-2 p-md-3">
                <i className={`bi ${stat.icon} text-${stat.color} fs-4 mb-1 mb-md-2`}></i>
                <h2 className={`fw-light text-${stat.color} mb-1`}>
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                </h2>
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE FILTERS DISPLAY - MOBILE */}
      {(statusFilter !== "all" || paymentMethodFilter !== "all" || searchQuery) && (
        <div className="alert alert-info alert-dismissible fade show d-md-none mb-3 py-2" role="alert">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <i className="bi bi-funnel me-1"></i>
              Filtered: 
              {statusFilter !== "all" && <span className="ms-1 fw-bold text-capitalize">{statusFilter}</span>}
              {paymentMethodFilter !== "all" && <span className="ms-1 fw-bold text-capitalize">{paymentMethodFilter}</span>}
              {searchQuery && <span className="ms-1 fw-bold">"{searchQuery}"</span>}
            </span>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => {
                setStatusFilter("all");
                setPaymentMethodFilter("all");
                setSearchQuery("");
              }}
            ></button>
          </div>
        </div>
      )}

      {/* MOBILE CARD VIEW (Hidden on Desktop) */}
      <div className="d-md-none">
        {invoicesLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted">
              <i className="bi bi-receipt display-6 text-secondary mb-3"></i>
              <h6 className="fw-bold mb-2">No invoices found</h6>
              {searchQuery || statusFilter !== "all" || paymentMethodFilter !== "all" ? (
                <>
                  <p className="mb-2">No invoices match your current filters</p>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setPaymentMethodFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <p className="mb-0">Create your first invoice to get started</p>
              )}
            </div>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <InvoiceCard key={invoice._id} invoice={invoice} />
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
      <div className="d-none d-md-block">
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="small text-muted text-uppercase">
                  <th className="ps-4 py-3">Invoice Details</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center pe-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {invoicesLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-receipt display-6 text-secondary mb-3"></i>
                        <h6 className="fw-bold mb-2">No invoices found</h6>
                        <p className="mb-0">Create your first invoice to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="ps-4">
                        <div className="d-flex flex-column">
                          <div className="fw-bold">{invoice.invoiceNumber}</div>
                          <div className="small text-muted">
                            {invoice.createdBy?.name && (
                              <span>By: {invoice.createdBy.name}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold">{invoice.customerName || "Walk-in Customer"}</div>
                      </td>
                      <td>
                        <div className="small">
                          {invoice.products?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="mb-1">
                              {item.product?.name || `Product ${idx + 1}`} × {item.quantity}
                            </div>
                          ))}
                          {invoice.products?.length > 2 && (
                            <span className="text-muted">
                              +{invoice.products.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-danger">
                          ${invoice.totalAmount?.toFixed(2)}
                        </div>
                        <div className="small text-muted">
                          {invoice.products?.length} items
                        </div>
                      </td>
                      <td>
                        {getPaymentMethodBadge(invoice.paymentMethod)}
                      </td>
                      <td>{getStatusBadge(invoice.status)}</td>
                      <td>
                        <div className="small">
                          {formatDate(invoice.soldAt || invoice.createdAt)}
                        </div>
                      </td>
                      <td className="text-center pe-4">
                        <div className="d-flex justify-content-center gap-2">
                          {invoice.status === "pending" && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleMarkAsPaid(invoice._id, invoice.invoiceNumber)}
                                title="Mark as Paid"
                                disabled={invoicesLoading}
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleCancelInvoice(invoice._id, invoice.invoiceNumber)}
                                title="Cancel Invoice"
                                disabled={invoicesLoading}
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            </>
                          )}
                          {invoice.status === "paid" && (
                            <span className="text-success small">
                              <i className="bi bi-check-circle me-1"></i>
                              Paid
                            </span>
                          )}
                          {invoice.status === "cancelled" && (
                            <span className="text-danger small">
                              <i className="bi bi-x-circle me-1"></i>
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <InvoiceForm
          onSubmit={handleInvoiceSubmit}
          onClose={() => setShowInvoiceForm(false)}
          loading={invoicesLoading}
        />
      )}
    </div>
  );
};

export default Invoices;