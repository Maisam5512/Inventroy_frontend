// src/pages/StockMovements.jsx
import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useStockMovements from "../hooks/useStockMovements";
import useProducts from "../hooks/useProducts";
import StockAdjustmentForm from "../components/StockAdjustmentForm";
import { toast } from "react-toastify";

const StockMovements = () => {
  const { user } = useAuth();
  const {
    stockMovements,
    loading: movementsLoading,
    reportData,
    profitLossData,
    setReportData,
    setProfitLossData,
    fetchStockMovements,
    manualAdjustment,
    getStockReport,
    getProfitLossReport,
    clearReportData,
    clearProfitLossData,
  } = useStockMovements();
  
  const { products, fetchProducts } = useProducts();
  
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [referenceTypeFilter, setReferenceTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Get user data
  const userData = user?.user || user;
  const userRole = userData?.role;

  useEffect(() => {
    fetchStockMovements();
    fetchProducts();
  }, []);

  // Filter stock movements
  const filteredMovements = stockMovements.filter(movement => {
    // Search filter
    const matchesSearch = !searchQuery.trim() || 
      movement.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.product?.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.note?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = typeFilter === "all" || movement.type === typeFilter;
    
    // Reference type filter
    const matchesReference = referenceTypeFilter === "all" || movement.referenceType === referenceTypeFilter;

    // Date filter
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const movementDate = new Date(movement.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = movementDate >= startDate && movementDate <= endDate;
    }

    return matchesSearch && matchesType && matchesReference && matchesDate;
  });

  // Handle stock adjustment
  const handleStockAdjustment = async (values) => {
    try {
      const result = await manualAdjustment(values);
      
      if (result.success) {
        toast.success("Stock adjusted successfully!");
        setShowAdjustmentForm(false);
        fetchStockMovements(); // Refresh the list
        fetchProducts(); // Refresh product stock
      } else {
        toast.error(result.message || "Failed to adjust stock");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  // Handle stock report generation
  const handleGenerateReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error("Please select both start and end dates");
      return;
    }

    const result = await getStockReport(dateRange.start, dateRange.end);
    if (result.success) {
      toast.success("Stock report generated successfully!");
    }
  };

  // Handle profit/loss report
  const handleProfitLossReport = async () => {
    const result = await getProfitLossReport();
    if (result.success) {
      toast.success("Profit/Loss report generated successfully!");
    }
  };

  // Get type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case "in":
        return <span className="badge bg-success">Stock In</span>;
      case "out":
        return <span className="badge bg-danger">Stock Out</span>;
      default:
        return <span className="badge bg-secondary">{type}</span>;
    }
  };

  // Get reference type badge
  const getReferenceTypeBadge = (type) => {
    const types = {
      purchase: { color: "primary", label: "Purchase" },
      sale: { color: "success", label: "Sale" },
      manual: { color: "warning", label: "Manual" },
      adjustment: { color: "info", label: "Adjustment" },
      return: { color: "secondary", label: "Return" },
    };
    
    const typeInfo = types[type] || { color: "dark", label: type };
    return <span className={`badge bg-${typeInfo.color}`}>{typeInfo.label}</span>;
  };

  // Calculate statistics
  const stats = {
    total: stockMovements.length,
    in: stockMovements.filter(m => m.type === "in").length,
    out: stockMovements.filter(m => m.type === "out").length,
    totalIn: stockMovements
      .filter(m => m.type === "in")
      .reduce((sum, movement) => sum + (movement.quantity || 0), 0),
    totalOut: stockMovements
      .filter(m => m.type === "out")
      .reduce((sum, movement) => sum + (movement.quantity || 0), 0),
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

  // Get movement icon
  const getMovementIcon = (type) => {
    return type === "in" ? "bi-arrow-down-circle-fill" : "bi-arrow-up-circle-fill";
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Clear date range
  const clearDateRange = () => {
    setDateRange({ start: "", end: "" });
    clearReportData();
    clearProfitLossData();
  };

  // Format report data for display
  const formatReportData = () => {
    if (!reportData || !Array.isArray(reportData)) return [];
    
    // Ensure we always have both "in" and "out" entries
    const inData = reportData.find(item => item._id === "in") || { _id: "in", totalQuantity: 0 };
    const outData = reportData.find(item => item._id === "out") || { _id: "out", totalQuantity: 0 };
    
    return [inData, outData];
  };

  // Calculate net stock change
  const netStockChange = stats.totalIn - stats.totalOut;

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h5 className="fw-bold mb-1">Stock Movements</h5>
          <div className="small text-muted">
            Track all inventory stock movements
            {searchQuery && (
              <span className="ms-2">
                for "<span className="fw-semibold">{searchQuery}</span>"
                <button 
                  className="btn btn-link btn-sm p-0 ms-2 text-danger"
                  onClick={clearSearch}
                >
                  <i className="bi bi-x-circle"></i> Clear
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
          {/* Search and Filters */}
          <div className="d-flex gap-2">
            <div className="input-group" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-secondary"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search movements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              className="form-select" 
              style={{ width: "auto" }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>

            <select 
              className="form-select" 
              style={{ width: "auto" }}
              value={referenceTypeFilter}
              onChange={(e) => setReferenceTypeFilter(e.target.value)}
            >
              <option value="all">All References</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="manual">Manual</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
            </select>
          </div>

          {/* New Adjustment Button */}
          <button 
            className="btn btn-danger fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={() => setShowAdjustmentForm(true)}
            disabled={movementsLoading}
            style={{ 
              minWidth: "160px",
              height: "38px",
              whiteSpace: "nowrap"
            }}
          >
            <i className="bi bi-plus-circle"></i> Adjust Stock
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold text-muted border-bottom pb-2 mb-3">
            <i className="bi bi-calendar-range me-2"></i>
            Date Range Filter & Reports
          </h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted">
                Start Date
              </label>
              <input
                type="date"
                className="form-control"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted">
                End Date
              </label>
              <input
                type="date"
                className="form-control"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end gap-2">
              <button
                className="btn btn-primary flex-grow-1"
                onClick={handleGenerateReport}
                disabled={movementsLoading || !dateRange.start || !dateRange.end}
              >
                <i className="bi bi-file-earmark-bar-graph me-2"></i>
                Generate Report
              </button>
              {(dateRange.start || dateRange.end) && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearDateRange}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      {(reportData || profitLossData) && (
        <div className="row g-3 mb-4">
          {/* Stock Report */}
          {reportData && (
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold text-muted border-bottom pb-2 mb-3">
                    <i className="bi bi-graph-up me-2"></i>
                    Stock Movement Report
                    <button
                      className="btn btn-sm btn-outline-secondary float-end"
                      onClick={clearReportData}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Movement Type</th>
                          <th className="text-end">Total Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formatReportData().map((item, index) => (
                          <tr key={index}>
                            <td>
                              <span className={`badge ${item._id === 'in' ? 'bg-success' : 'bg-danger'}`}>
                                {item._id === 'in' ? 'Stock In' : 'Stock Out'}
                              </span>
                            </td>
                            <td className="text-end fw-bold">
                              {item.totalQuantity || 0}
                            </td>
                          </tr>
                        ))}
                        {/* Net Change Row */}
                        <tr className="table-light">
                          <td className="fw-bold">Net Change</td>
                          <td className={`text-end fw-bold ${netStockChange >= 0 ? 'text-success' : 'text-danger'}`}>
                            {netStockChange >= 0 ? '+' : ''}{netStockChange}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="small text-muted mt-2">
                    Period: {dateRange.start} to {dateRange.end}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profit/Loss Report */}
          {profitLossData && (
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="fw-bold text-muted border-bottom pb-2 mb-3">
                    <i className="bi bi-cash-coin me-2"></i>
                    Profit & Loss Report
                    <button
                      className="btn btn-sm btn-outline-secondary float-end"
                      onClick={clearProfitLossData}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </h6>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="small text-muted">Revenue</div>
                      <h4 className="fw-bold text-success">
                        ${profitLossData.revenue?.toFixed(2) || "0.00"}
                      </h4>
                    </div>
                    <div className="col-4">
                      <div className="small text-muted">Cost</div>
                      <h4 className="fw-bold text-danger">
                        ${profitLossData.cost?.toFixed(2) || "0.00"}
                      </h4>
                    </div>
                    <div className="col-4">
                      <div className="small text-muted">Profit</div>
                      <h4 className={`fw-bold ${(profitLossData.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                        ${(profitLossData.profit || 0).toFixed(2)}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profit/Loss Report Button */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <button
                  className="btn btn-warning fw-bold d-flex align-items-center gap-2"
                  onClick={handleProfitLossReport}
                  disabled={movementsLoading}
                >
                  <i className="bi bi-calculator"></i>
                  Generate Profit/Loss Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Movements", value: stats.total, color: "primary", icon: "bi-arrow-left-right" },
          { label: "Stock In", value: stats.in, color: "success", icon: "bi-arrow-down-circle" },
          { label: "Stock Out", value: stats.out, color: "danger", icon: "bi-arrow-up-circle" },
          { 
            label: "Net Stock Change", 
            value: netStockChange, 
            color: netStockChange >= 0 ? "success" : "danger", 
            icon: netStockChange >= 0 ? "bi-plus-circle" : "bi-dash-circle" 
          },
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

      {/* Stock Movements Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light border-bottom">
              <tr className="small text-muted text-uppercase">
                <th className="ps-4 py-3">Product</th>
                <th>Movement</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Stock Before</th>
                <th>Stock After</th>
                <th>Performed By</th>
                <th>Date</th>
                <th className="text-center pe-4">Notes</th>
              </tr>
            </thead>

            <tbody>
              {movementsLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <div className="text-muted">
                      {searchQuery || typeFilter !== "all" || referenceTypeFilter !== "all" || dateRange.start || dateRange.end ? (
                        <div>
                          <i className="bi bi-search display-6 text-secondary mb-3"></i>
                          <h6 className="fw-bold mb-2">No stock movements found</h6>
                          <p className="mb-0">
                            No movements match your current filters
                          </p>
                          <button 
                            className="btn btn-link btn-sm p-0 mt-2"
                            onClick={() => {
                              setSearchQuery("");
                              setTypeFilter("all");
                              setReferenceTypeFilter("all");
                              clearDateRange();
                            }}
                          >
                            Clear filters to show all movements
                          </button>
                        </div>
                      ) : (
                        <div>
                          <i className="bi bi-arrow-left-right display-6 text-secondary mb-3"></i>
                          <h6 className="fw-bold mb-2">No stock movements found</h6>
                          <p className="mb-0">Adjust stock to see movement history</p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement._id}>
                    <td className="ps-4">
                      <div className="d-flex flex-column">
                        <div className="fw-bold">{movement.product?.name || "Unknown Product"}</div>
                        <div className="small text-muted">
                          SKU: {movement.product?.sku || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${getMovementIcon(movement.type)} text-${movement.type === 'in' ? 'success' : 'danger'}`}></i>
                        {getTypeBadge(movement.type)}
                      </div>
                    </td>
                    <td>
                      <div className={`fw-bold ${movement.type === 'in' ? 'text-success' : 'text-danger'}`}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </div>
                    </td>
                    <td>{getReferenceTypeBadge(movement.referenceType)}</td>
                    <td>
                      <div className="fw-bold">{movement.previousStock}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-primary">{movement.newStock}</div>
                    </td>
                    <td>
                      <div className="small">
                        {movement.performedBy?.name || "System"}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {formatDate(movement.createdAt)}
                      </div>
                    </td>
                    <td className="pe-4">
                      {movement.note ? (
                        <div className="small text-muted" style={{ maxWidth: "200px" }}>
                          {movement.note}
                        </div>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Form Modal */}
      {showAdjustmentForm && (
        <StockAdjustmentForm
          onSubmit={handleStockAdjustment}
          onClose={() => setShowAdjustmentForm(false)}
          loading={movementsLoading}
        />
      )}
    </div>
  );
};

export default StockMovements;