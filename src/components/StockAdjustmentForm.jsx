// src/components/StockAdjustmentForm.jsx
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useProducts from "../hooks/useProducts";

const StockAdjustmentForm = ({ onSubmit, onClose, loading, product }) => {
  const { products, fetchProducts } = useProducts();
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      await fetchProducts();
      setIsLoadingData(false);
    };
    fetchData();
  }, []);

  const validationSchema = Yup.object({
    productId: Yup.string().required("Product is required"),
    type: Yup.string().required("Movement type is required"),
    quantity: Yup.number().min(1, "Minimum 1").required("Quantity is required"),
    note: Yup.string(),
  });

  const initialFormValues = {
    productId: product?._id || "",
    type: "in",
    quantity: 1,
    note: "",
  };

  const handleSubmit = (values, { setSubmitting }) => {
    onSubmit(values);
    setSubmitting(false);
  };

  const getSelectedProduct = (productId) => {
    return products.find(p => p._id === productId);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-arrow-left-right me-2"></i>
              Adjust Stock
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading || isLoadingData}
            ></button>
          </div>

          {isLoadingData ? (
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading products...</p>
            </div>
          ) : (
            <Formik
              initialValues={initialFormValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form>
                  <div className="modal-body">
                    <div className="row g-3">
                      {/* Product Selection */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-muted">
                          Product *
                        </label>
                        <Field as="select" name="productId" className="form-select">
                          <option value="">Select Product</option>
                          {products.map((prod) => (
                            <option key={prod._id} value={prod._id}>
                              {prod.name} (SKU: {prod.sku}) - Current Stock: {prod.quantity}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="productId"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      {/* Movement Type */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-muted">
                          Movement Type *
                        </label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <Field
                              type="radio"
                              name="type"
                              value="in"
                              className="form-check-input"
                              id="typeIn"
                            />
                            <label className="form-check-label text-success fw-bold" htmlFor="typeIn">
                              <i className="bi bi-arrow-down-circle me-1"></i>
                              Stock In (Add)
                            </label>
                          </div>
                          <div className="form-check">
                            <Field
                              type="radio"
                              name="type"
                              value="out"
                              className="form-check-input"
                              id="typeOut"
                            />
                            <label className="form-check-label text-danger fw-bold" htmlFor="typeOut">
                              <i className="bi bi-arrow-up-circle me-1"></i>
                              Stock Out (Remove)
                            </label>
                          </div>
                        </div>
                        <ErrorMessage
                          name="type"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-muted">
                          Quantity *
                        </label>
                        <Field
                          type="number"
                          name="quantity"
                          className="form-control"
                          min="1"
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value) || 1;
                            setFieldValue("quantity", quantity);
                            
                            // Check if we're removing more than available
                            const selectedProduct = getSelectedProduct(values.productId);
                            if (selectedProduct && values.type === "out" && quantity > selectedProduct.quantity) {
                              setFieldValue("quantity", selectedProduct.quantity);
                            }
                          }}
                        />
                        <ErrorMessage
                          name="quantity"
                          component="div"
                          className="text-danger small mt-1"
                        />
                        {values.productId && (
                          <div className="small mt-2">
                            <span className="text-muted">Current Stock: </span>
                            <span className="fw-bold">
                              {getSelectedProduct(values.productId)?.quantity || 0}
                            </span>
                            {values.type === "in" ? (
                              <span className="text-success ms-2">
                                → After: {getSelectedProduct(values.productId)?.quantity + (values.quantity || 0)}
                              </span>
                            ) : (
                              <span className="text-danger ms-2">
                                → After: {Math.max(0, getSelectedProduct(values.productId)?.quantity - (values.quantity || 0))}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Note */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-muted">
                          Note (Optional)
                        </label>
                        <Field
                          as="textarea"
                          name="note"
                          className="form-control"
                          rows="3"
                          placeholder="Reason for stock adjustment..."
                        />
                        <ErrorMessage
                          name="note"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer bg-light">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Adjusting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Adjust Stock
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentForm;