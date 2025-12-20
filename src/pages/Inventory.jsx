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
    updateStock 
  } = useProducts();
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({ show: false, productId: null, quantity: 0 });
  const [searchQuery, setSearchQuery] = useState("");

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

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to deactivate this product?")) {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success("Product deactivated successfully!");
      }
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
    if (quantity === 0) return <span className="badge bg-danger">Out of Stock</span>;
    if (quantity <= threshold) return <span className="badge bg-warning text-dark">Low Stock</span>;
    return <span className="badge bg-success">In Stock</span>;
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      {/* Search Bar and Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
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

        <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
          {/* Search Bar - Visible on all screen sizes */}
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-secondary"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name, SKU, or category..."
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

          {/* New Item Button - Only for admin */}
          {userRole === "admin" && (
            <button 
              className="btn btn-danger fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(true);
              }}
              style={{ minWidth: "120px" }}
            >
              <i className="bi bi-plus-circle"></i> New Item
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
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
                    <td className="fw-bold">${product.purchasePrice?.toFixed(2)}</td>
                    <td className="fw-bold text-success">${product.sellingPrice?.toFixed(2)}</td>
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
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteProduct(product._id)}
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

      {/* <style>
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
          .table th, .table td {
            vertical-align: middle !important;
          }
          .badge {
            font-weight: 500;
          }
          .search-highlight {
            background-color: #fff3cd !important;
          }
        `}
      </style> */}
    </div>
  );
};

export default Inventory;
