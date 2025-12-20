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

  // Get user role from response
  const userData = user?.user || user;
  const userRole = userData?.role;

  useEffect(() => {
    fetchProducts();
  }, []);

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

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">All Items ({products.length})</h5>

        {/* Show button only for admin */}
        {userRole === "admin" && (
          <button 
            className="btn btn-danger fw-bold shadow-sm d-flex align-items-center gap-1"
            onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}
          >
            <i className="bi bi-plus-circle"></i> New Item
          </button>
        )}
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={userRole === "admin" ? 9 : 8} className="text-center py-5 text-muted">
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td className="ps-4">
                      <div className="d-flex flex-column">
                        <div className={`fw-bold ${product.quantity <= product.lowStockThreshold ? "text-danger" : ""}`}>
                          {product.name}
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
                      <span className="badge bg-light text-dark border">{product.sku}</span>
                    </td>
                    <td>
                      {product.category?.name || (
                        <span className="text-muted small">No category</span>
                      )}
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
          .table th, .table td {
            vertical-align: middle !important;
          }
          .badge {
            font-weight: 500;
          }
        `}
      </style>
    </div>
  );
};

export default Inventory;
