// src/pages/Invoices.jsx
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

  // Get payment method badge
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

  // Format date
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

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h5 className="fw-bold mb-1">Sales Invoices</h5>
          <div className="small text-muted">
            Manage customer invoices and sales
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
          {/* Search and Filters */}
          <div className="d-flex flex-wrap gap-2">
            <div className="input-group" style={{ maxWidth: "300px" }}>
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

            <select 
              className="form-select" 
              style={{ width: "auto" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select 
              className="form-select" 
              style={{ width: "auto" }}
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

          {/* New Invoice Button */}
          <button 
            className="btn btn-danger fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={() => setShowInvoiceForm(true)}
            style={{ minWidth: "140px", height: "38px" , whiteSpace: "nowrap" }}
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

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Invoices", value: stats.total, color: "primary", icon: "bi-receipt" },
          { label: "Pending", value: stats.pending, color: "warning", icon: "bi-clock" },
          { label: "Paid", value: stats.paid, color: "success", icon: "bi-check-circle" },
          { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, color: "danger", icon: "bi-currency-dollar" },
        ].map((stat, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className={`card border-0 shadow-sm dashboard-card border-top border-${stat.color} border-4 h-100`}>
              <div className="card-body text-center">
                <i className={`bi ${stat.icon} text-${stat.color} fs-4 mb-2`}></i>
                <h2 className={`fw-light text-${stat.color}`}>{stat.value}</h2>
                <div className="small text-muted fw-bold text-uppercase mt-1">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invoices Table */}
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