import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import usePurchaseOrders from "../hooks/usePurchaseOrders";
import useVendors from "../hooks/useVendors";
import useProducts from "../hooks/useProducts";
import PurchaseOrderForm from "../components/PurchaseOrderForm";
import { toast } from "react-toastify";

const PurchaseOrders = () => {
  const { user } = useAuth();
  const {
    purchaseOrders,
    loading: ordersLoading,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    markAsDelivered,
    cancelPurchaseOrder,
  } = usePurchaseOrders();
  
  const { fetchVendors } = useVendors();
  const { fetchProducts } = useProducts();
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get user role
  const userData = user?.user || user;
  const userRole = userData?.role;

  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
    fetchProducts();
  }, []);

  // Filter orders
  const filteredOrders = purchaseOrders.filter(order => {
    // Search filter
    const matchesSearch = !searchQuery.trim() || 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle order form submission
  const handleOrderSubmit = async (values) => {
    try {
      // Prepare data for API
      const orderData = {
        ...values,
        products: values.products.map(item => ({
          product: item.product,
          quantity: Number(item.quantity),
          purchasePrice: Number(item.purchasePrice)
        }))
      };

      const result = editingOrder 
        ? await updatePurchaseOrder(editingOrder._id, orderData)
        : await createPurchaseOrder(orderData);
      
      if (result.success) {
        toast.success(
          editingOrder 
            ? "Purchase order updated successfully!"
            : "Purchase order created successfully!"
        );
        setShowOrderForm(false);
        setEditingOrder(null);
        fetchPurchaseOrders(); // Refresh the list
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  // Handle mark as delivered
  const handleMarkAsDelivered = async (orderId) => {
    if (window.confirm("Mark this order as delivered? This will update stock quantities.")) {
      const result = await markAsDelivered(orderId);
      if (result.success) {
        toast.success("Order marked as delivered and stock updated!");
      }
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      const result = await cancelPurchaseOrder(orderId);
      if (result.success) {
        toast.success("Order cancelled successfully!");
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "delivered":
        return <span className="badge bg-success">Delivered</span>;
      case "cancelled":
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Calculate statistics
  const stats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter(o => o.status === "pending").length,
    delivered: purchaseOrders.filter(o => o.status === "delivered").length,
    cancelled: purchaseOrders.filter(o => o.status === "cancelled").length,
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format date for mobile (shorter)
  const formatDateMobile = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Mobile card component
  const OrderCard = ({ order }) => (
    <div className="card mb-3 border-0 shadow-sm">
      <div className="card-body">
        {/* Card Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="fw-bold mb-0">{order.orderNumber}</h6>
            <div className="small text-muted">{formatDateMobile(order.createdAt)}</div>
          </div>
          <div className="text-end">
            <div className="fw-bold text-danger">${order.totalAmount?.toFixed(2)}</div>
            <div className="small text-muted">{order.products?.length} items</div>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="mb-2">
          <div className="small text-muted">Vendor</div>
          <div className="fw-semibold">{order.vendor?.name}</div>
          <div className="small text-muted">{order.vendor?.companyName}</div>
        </div>

        {/* Products Preview */}
        <div className="mb-2">
          <div className="small text-muted">Products</div>
          <div className="small">
            {order.products?.slice(0, 2).map((item, idx) => (
              <div key={idx} className="mb-1">
                • {item.product?.name || `Product ${idx + 1}`} × {item.quantity}
              </div>
            ))}
            {order.products?.length > 2 && (
              <span className="text-muted">
                +{order.products.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Status and Dates */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="small text-muted">Status</div>
            <div>{getStatusBadge(order.status)}</div>
          </div>
          <div className="col-6">
            <div className="small text-muted">Delivery</div>
            <div className="fw-semibold">
              {order.expectedDeliveryDate 
                ? formatDateMobile(order.expectedDeliveryDate)
                : "N/A"
              }
            </div>
          </div>
        </div>

        {/* Actions - Admin Only */}
        {userRole === "admin" && (
          <div className="border-top pt-3">
            <div className="d-flex justify-content-center gap-2">
              {order.status === "pending" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-primary flex-fill"
                    onClick={() => {
                      setEditingOrder(order);
                      setShowOrderForm(true);
                    }}
                    title="Edit"
                  >
                    <i className="bi bi-pencil-square me-1"></i> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success flex-fill"
                    onClick={() => handleMarkAsDelivered(order._id)}
                    title="Mark as Delivered"
                  >
                    <i className="bi bi-check-circle me-1"></i> Deliver
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger flex-fill"
                    onClick={() => handleCancelOrder(order._id)}
                    title="Cancel"
                  >
                    <i className="bi bi-x-circle me-1"></i> Cancel
                  </button>
                </>
              )}
              {order.status === "delivered" && (
                <button className="btn btn-sm btn-success w-100" disabled>
                  <i className="bi bi-check-circle me-1"></i> Delivered
                </button>
              )}
              {order.status === "cancelled" && (
                <button className="btn btn-sm btn-danger w-100" disabled>
                  <i className="bi bi-x-circle me-1"></i> Cancelled
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-3 py-md-4 bg-light min-vh-100">
      {/* Header - Mobile Optimized */}
      <div className="row align-items-center mb-3 mb-md-4">
        <div className="col-12 col-md-6 mb-3 mb-md-0">
          <h5 className="fw-bold mb-1">Purchase Orders</h5>
          <div className="small text-muted">
            Managing orders from vendors and suppliers
          </div>
        </div>

        {/* Search, Filter and Button - Mobile Optimized */}
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-md-row gap-2">
            {/* Search and Filter Row */}
            <div className="d-flex gap-2 mb-2 mb-md-0">
              <div className="input-group flex-grow-1">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Dropdown - Mobile Optimized */}
              <div className="dropdown d-md-none">
                <button 
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-funnel"></i>
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button 
                      className={`dropdown-item ${statusFilter === "all" ? "active" : ""}`}
                      onClick={() => setStatusFilter("all")}
                    >
                      All Status
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`dropdown-item ${statusFilter === "pending" ? "active" : ""}`}
                      onClick={() => setStatusFilter("pending")}
                    >
                      Pending
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`dropdown-item ${statusFilter === "delivered" ? "active" : ""}`}
                      onClick={() => setStatusFilter("delivered")}
                    >
                      Delivered
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`dropdown-item ${statusFilter === "cancelled" ? "active" : ""}`}
                      onClick={() => setStatusFilter("cancelled")}
                    >
                      Cancelled
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Status Filter (Desktop) */}
            <select 
              className="form-select d-none d-md-block" 
              style={{ width: "auto", minWidth: "140px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* New Order Button - Admin only */}
            {userRole === "admin" && (
              <button 
                className="btn btn-danger fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  setEditingOrder(null);
                  setShowOrderForm(true);
                }}
                disabled={ordersLoading}
              >
                {ordersLoading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>
                    <i className="bi bi-plus-circle"></i> 
                    <span className="d-none d-md-inline">New Order</span>
                    <span className="d-md-none">New</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="row g-2 g-md-3 mb-3 mb-md-4">
        {[
          { label: "Total Orders", value: stats.total, color: "primary", icon: "bi-receipt" },
          { label: "Pending", value: stats.pending, color: "warning", icon: "bi-clock" },
          { label: "Delivered", value: stats.delivered, color: "success", icon: "bi-check-circle" },
          { label: "Cancelled", value: stats.cancelled, color: "danger", icon: "bi-x-circle" },
        ].map((stat, i) => (
          <div key={i} className="col-6 col-sm-3">
            <div className={`card border-0 shadow-sm dashboard-card border-top border-${stat.color} border-4 h-100`}>
              <div className="card-body text-center p-2 p-md-3">
                <i className={`bi ${stat.icon} text-${stat.color} fs-4 mb-2`}></i>
                <h2 className={`fw-light text-${stat.color} mb-1`}>{stat.value}</h2>
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Filter Display - Mobile */}
      {statusFilter !== "all" && (
        <div className="alert alert-info alert-dismissible fade show d-md-none mb-3 py-2" role="alert">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <i className="bi bi-funnel me-1"></i>
              Filtered by: <span className="fw-bold text-capitalize">{statusFilter}</span>
            </span>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setStatusFilter("all")}
            ></button>
          </div>
        </div>
      )}

      {/* MOBILE CARD VIEW (Hidden on Desktop) */}
      <div className="d-md-none">
        {ordersLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted">
              <i className="bi bi-inbox display-6 text-secondary mb-3"></i>
              <h6 className="fw-bold mb-2">No purchase orders found</h6>
              {searchQuery || statusFilter !== "all" ? (
                <>
                  <p className="mb-2">No orders match your current filters</p>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <p className="mb-0">Create your first purchase order to get started</p>
              )}
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
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
                  <th className="ps-4 py-3">Order Details</th>
                  <th>Vendor</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                  {userRole === "admin" && <th className="text-center pe-4">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? 7 : 6} className="text-center py-5">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? 7 : 6} className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-inbox display-6 text-secondary mb-3"></i>
                        <h6 className="fw-bold mb-2">No purchase orders found</h6>
                        <p className="mb-0">Create your first purchase order to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="ps-4">
                        <div className="d-flex flex-column">
                          <div className="fw-bold">{order.orderNumber}</div>
                          <div className="small text-muted">
                            {formatDate(order.createdAt)}
                          </div>
                          {order.createdBy?.name && (
                            <div className="small text-muted">
                              By: {order.createdBy.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <div className="fw-bold">{order.vendor?.name}</div>
                          <div className="small text-muted">
                            {order.vendor?.companyName}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {order.products?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="mb-1">
                              {item.product?.name || `Product ${idx + 1}`} × {item.quantity}
                            </div>
                          ))}
                          {order.products?.length > 2 && (
                            <span className="text-muted">
                              +{order.products.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-danger">
                          ₹{order.totalAmount?.toFixed(2)}
                        </div>
                        <div className="small text-muted">
                          {order.products?.length} items
                        </div>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <div>
                            {order.expectedDeliveryDate 
                              ? formatDate(order.expectedDeliveryDate)
                              : "N/A"
                            }
                          </div>
                          {order.receivedAt && (
                            <div className="small text-muted">
                              Received: {formatDate(order.receivedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      {userRole === "admin" && (
                        <td className="text-center pe-4">
                          <div className="d-flex justify-content-center gap-2">
                            {order.status === "pending" && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setEditingOrder(order);
                                    setShowOrderForm(true);
                                  }}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleMarkAsDelivered(order._id)}
                                  title="Mark as Delivered"
                                >
                                  <i className="bi bi-check-circle"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancelOrder(order._id)}
                                  title="Cancel"
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              </>
                            )}
                            {order.status === "delivered" && (
                              <span className="text-success small">
                                <i className="bi bi-check-circle me-1"></i>
                                Delivered
                              </span>
                            )}
                            {order.status === "cancelled" && (
                              <span className="text-danger small">
                                <i className="bi bi-x-circle me-1"></i>
                                Cancelled
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Purchase Order Form Modal */}
      {showOrderForm && (
        <PurchaseOrderForm
          onSubmit={handleOrderSubmit}
          onClose={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
          loading={ordersLoading}
          initialValues={editingOrder}
        />
      )}
    </div>
  );
};

export default PurchaseOrders;