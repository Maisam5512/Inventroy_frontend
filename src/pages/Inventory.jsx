import React, { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useProducts from "../hooks/useProducts";
import ProductForm from "../components/ProductForm";
import { toast } from "react-toastify";

const Inventory = () => {
  const { user } = useAuth();
  const { 
    products, 
    loading: productsLoading, 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    toggleProductStatus,
    updateStock 
  } = useProducts();
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({ show: false, productId: null, quantity: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [deletingItem, setDeletingItem] = useState({ type: null, id: null, name: null });

  // Get user role from response
  const userData = user?.user || user;
  const userRole = userData?.role;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const name = product.name?.toLowerCase() || "";
    const sku = product.sku?.toLowerCase() || "";
    const category = product.category?.name?.toLowerCase() || "";
    
    return (
      name.includes(query) ||
      sku.includes(query) ||
      category.includes(query)
    );
  });

  // Handle product form submission
  const handleProductSubmit = async (values) => {
    const result = editingProduct 
      ? await updateProduct(editingProduct._id, values)
      : await createProduct(values);
    
    if (result.success) {
      setShowProductForm(false);
      setEditingProduct(null);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (id, name) => {
    setDeletingItem({ type: 'product', id, name });
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    const { id } = deletingItem;
    
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        setDeletingItem({ type: null, id: null, name: null });
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle toggle product status
  const handleToggleStatus = async (id) => {
    const result = await toggleProductStatus(id);
    if (result.success) {
      toast.success(`Product status updated to ${result.data.status}`);
    }
  };

  // Handle stock update
  const handleStockUpdate = async () => {
    if (!stockUpdate.productId || !stockUpdate.quantity) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const result = await updateStock(stockUpdate.productId, parseInt(stockUpdate.quantity));
    if (result.success) {
      setStockUpdate({ show: false, productId: null, quantity: 0 });
    }
  };

  // Get stock status badge
  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return <span className="badge bg-danger">Out of stock</span>;
    if (quantity <= threshold) return <span className="badge bg-warning text-dark">Low Stock</span>;
    return <span className="badge bg-success">In Stock</span>;
  };

  // Get stock status for mobile card
  const getStockStatusMobile = (quantity, threshold) => {
    if (quantity === 0) return <span className="badge bg-danger">Out of Stock</span>;
    if (quantity <= threshold) return <span className="badge bg-warning text-dark">Low Stock</span>;
    return <span className="badge bg-success">In Stock</span>;
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Format currency to Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mobile view product card
  const ProductCard = ({ product }) => (
    <div className="card mb-3 border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h6 className={`fw-bold mb-1 ${product.quantity <= product.lowStockThreshold ? "text-danger" : ""}`}>
              {product.name}
            </h6>
            <div className="small text-muted mb-2">
              {product.description && product.description.length > 60 
                ? `${product.description.substring(0, 60)}...` 
                : product.description}
            </div>
          </div>
          {userRole === "admin" && (
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-outline-secondary border-0"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-three-dots-vertical"></i>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowProductForm(true);
                    }}
                  >
                    <i className="bi bi-pencil-square me-2"></i> Edit
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item text-info"
                    onClick={() => handleToggleStatus(product._id)}
                  >
                    <i className={`bi ${product.status === "active" ? "bi-pause-circle" : "bi-play-circle"} me-2`}></i>
                    {product.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item text-danger"
                    onClick={() => handleDeleteClick(product._id, product.name)}
                  >
                    <i className="bi bi-trash3 me-2"></i> Delete
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={() => setStockUpdate({ 
                      show: true, 
                      productId: product._id, 
                      quantity: 0 
                    })}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i> Adjust Stock
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="row g-2 mb-2">
          <div className="col-6">
            <div className="small text-muted">SKU</div>
            <div className="fw-semibold">{product.sku}</div>
          </div>
          <div className="col-6">
            <div className="small text-muted">Category</div>
            <div className="fw-semibold">{product.category?.name || "No category"}</div>
          </div>
        </div>

        <div className="row g-2 mb-2">
          <div className="col-6">
            <div className="small text-muted">Purchase Price</div>
            <div className="fw-bold">{formatCurrency(product.purchasePrice)}</div>
          </div>
          <div className="col-6">
            <div className="small text-muted">Selling Price</div>
            <div className="fw-bold text-success">{formatCurrency(product.sellingPrice)}</div>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <div className="small text-muted">Stock</div>
            <div className="d-flex align-items-center gap-2">
              <span className={`fw-bold ${product.quantity <= product.lowStockThreshold ? "text-danger" : ""}`}>
                {product.quantity} {product.unit}
              </span>
              {getStockStatusMobile(product.quantity, product.lowStockThreshold)}
            </div>
          </div>
          <div className="col-6">
            <div className="small text-muted">Low Stock</div>
            <div className="fw-semibold">{product.lowStockThreshold}</div>
          </div>
        </div>

        <div className="mt-2">
          <div className="small text-muted">Status</div>
          <span className={`badge px-3 ${product.status === "active" ? "bg-success" : "bg-secondary"}`}>
            {product.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-3 py-md-4 bg-light min-vh-100">
      {/* HEADER SECTION - MOBILE OPTIMIZED */}
      <div className="row align-items-center mb-3 mb-md-4">
        <div className="col-12 col-md-6">
          <h5 className="fw-bold mb-1">All Products</h5>
          <div className="small text-muted">
            Showing {filteredProducts.length} of {products.length} items
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

        {/* SEARCH AND ACTIONS - MOBILE OPTIMIZED */}
        <div className="col-12 col-md-6 mt-3 mt-md-0">
          <div className="d-flex flex-column flex-md-row gap-2">
            {/* MOBILE SEARCH BAR */}
            <div className="d-flex gap-2">
              <div className="input-group flex-grow-1">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={clearSearch}
                    title="Clear search"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
              
              {/* MOBILE FILTER TOGGLE */}
              <button
                className="btn btn-outline-secondary d-md-none"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                title="Filter options"
              >
                <i className="bi bi-funnel"></i>
              </button>
            </div>

            {/* NEW ITEM BUTTON */}
            {userRole === "admin" && (
              <button 
                className="btn btn-danger fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-2 mt-md-0"
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
              >
                <i className="bi bi-plus-circle"></i> 
                <span className="d-none d-md-inline">New Item</span>
                <span className="d-md-none">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE PRODUCT CARDS (Hidden on Desktop) */}
      <div className="d-md-none">
        {productsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted">
              {searchQuery ? (
                <div>
                  <i className="bi bi-search display-6 text-secondary mb-3"></i>
                  <h6 className="fw-bold mb-2">No products found</h6>
                  <p className="mb-0">No products match "<span className="fw-semibold">{searchQuery}</span>"</p>
                  <button 
                    className="btn btn-link btn-sm p-0 mt-2"
                    onClick={clearSearch}
                  >
                    Clear search to show all products
                  </button>
                </div>
              ) : (
                <div>
                  <i className="bi bi-inbox display-6 text-secondary mb-3"></i>
                  <h6 className="fw-bold mb-2">No products found</h6>
                  <p className="mb-0">Add your first product to get started</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>

      {/* DESKTOP TABLE (Hidden on Mobile) */}
      <div className="d-none d-md-block">
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light border-bottom">
                <tr className="small text-muted text-uppercase">
                  <th className="ps-4 py-3">Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Low Stock Level</th>
                  <th className="text-center">Status</th>
                  {userRole === "admin" && <th className="text-center pe-4">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {productsLoading ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? 9 : 8} className="text-center py-5">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={userRole === "admin" ? 9 : 8} className="text-center py-5">
                      <div className="text-muted">
                        {searchQuery ? (
                          <div>
                            <i className="bi bi-search display-6 text-secondary mb-3"></i>
                            <h6 className="fw-bold mb-2">No products found</h6>
                            <p className="mb-0">No products match "<span className="fw-semibold">{searchQuery}</span>"</p>
                            <button 
                              className="btn btn-link btn-sm p-0 mt-2"
                              onClick={clearSearch}
                            >
                              Clear search to show all products
                            </button>
                          </div>
                        ) : (
                          <div>
                            <i className="bi bi-inbox display-6 text-secondary mb-3"></i>
                            <h6 className="fw-bold mb-2">No products found</h6>
                            <p className="mb-0">Add your first product to get started</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="ps-4">
                        <div className="d-flex flex-column">
                          <div className={`fw-bold ${product.quantity <= product.lowStockThreshold ? "text-danger" : ""}`}>
                            {product.name}
                            {/* Highlight search matches */}
                            {searchQuery && (product.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                              <span className="badge bg-info-subtle text-info ms-2">Name match</span>
                            ))}
                          </div>
                          {product.description && (
                            <div className="small text-muted mt-1" style={{ maxWidth: "250px" }}>
                              {product.description.length > 40 
                                ? `${product.description.substring(0, 40)}...` 
                                : product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {product.sku}
                          {/* Highlight search matches */}
                          {searchQuery && (product.sku.toLowerCase().includes(searchQuery.toLowerCase()) && (
                            <span className="ms-1 text-success"><i className="bi bi-check-circle"></i></span>
                          ))}
                        </span>
                      </td>
                      <td>
                        {product.category?.name || (
                          <span className="text-muted small">No category</span>
                        )}
                        {/* Highlight search matches */}
                        {searchQuery && (product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <span className="badge bg-warning-subtle text-warning ms-2">Category match</span>
                        ))}
                      </td>
                      <td className="fw-bold">{formatCurrency(product.purchasePrice)}</td>
                      <td className="fw-bold text-success">{formatCurrency(product.sellingPrice)}</td>
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center">
                          <span className={`fw-bold ${product.quantity <= product.lowStockThreshold ? "text-danger" : ""}`}>
                            {product.quantity} {product.unit}
                          </span>
                          {getStockStatus(product.quantity, product.lowStockThreshold)}
                          {userRole === "admin" && (
                            <button
                              className="btn btn-sm btn-outline-secondary mt-1"
                              onClick={() => setStockUpdate({ 
                                show: true, 
                                productId: product._id, 
                                quantity: 0 
                              })}
                              title="Update Stock"
                              style={{ fontSize: "0.7rem", padding: "0.1rem 0.3rem" }}
                            >
                              <i className="bi bi-arrow-clockwise"></i> Adjust
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border">
                          {product.lowStockThreshold}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge px-3 ${product.status === "active" ? "bg-success" : "bg-secondary"}`}>
                          {product.status}
                        </span>
                      </td>
                      {userRole === "admin" && (
                        <td className="text-center pe-4">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setEditingProduct(product);
                                setShowProductForm(true);
                              }}
                              title="Edit"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className={`btn btn-sm ${product.status === "active" ? "btn-outline-warning" : "btn-outline-success"}`}
                              onClick={() => handleToggleStatus(product._id)}
                              title={product.status === "active" ? "Deactivate" : "Activate"}
                            >
                              <i className={`bi ${product.status === "active" ? "bi-pause" : "bi-play"}`}></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteClick(product._id, product.name)}
                              title="Delete"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
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

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          onSubmit={handleProductSubmit}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          loading={productsLoading}
          initialValues={editingProduct}
        />
      )}

      {/* Stock Update Modal */}
      {stockUpdate.show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-box-arrow-in-down me-2"></i>
                  Update Stock
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setStockUpdate({ show: false, productId: null, quantity: 0 })}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">
                    Quantity Change (positive for adding, negative for removing)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={stockUpdate.quantity}
                    onChange={(e) => setStockUpdate({...stockUpdate, quantity: e.target.value})}
                    placeholder="e.g., 10 or -5"
                  />
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setStockUpdate({ show: false, productId: null, quantity: 0 })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleStockUpdate}
                  disabled={!stockUpdate.quantity}
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem.type && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Permanent Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeletingItem({ type: null, id: null, name: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to <strong className="text-danger">PERMANENTLY DELETE</strong> the product 
                  <strong> "{deletingItem.name}"</strong>?
                  <br />
                  <small className="text-muted">
                    <i className="bi bi-exclamation-triangle-fill text-danger me-1"></i>
                    This action cannot be undone and will permanently remove all product data.
                  </small>
                </p>
                <p className="text-warning">
                  <i className="bi bi-info-circle me-1"></i>
                  Note: For temporary deactivation, use the status toggle instead.
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
                  disabled={productsLoading}
                >
                  {productsLoading ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : null}
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
