// src/components/InvoiceForm.jsx
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import useProducts from "../hooks/useProducts";

const InvoiceForm = ({ onSubmit, onClose, loading }) => {
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
    invoiceNumber: Yup.string().required("Invoice number is required"),
    customerName: Yup.string().required("Customer name is required"),
    paymentMethod: Yup.string().required("Payment method is required"),
    products: Yup.array()
      .of(
        Yup.object().shape({
          product: Yup.string().required("Product is required"),
          quantity: Yup.number().min(1, "Minimum 1").required("Quantity is required"),
          sellingPrice: Yup.number().min(0.01, "Must be greater than 0").required("Selling price is required"),
        })
      )
      .min(1, "At least one product is required"),
  });

  const initialFormValues = {
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: "",
    paymentMethod: "cash",
    products: [{ product: "", quantity: 1, sellingPrice: 0 }],
  };

  const calculateTotal = (products) => {
    return products.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.sellingPrice) || 0;
      return total + (quantity * price);
    }, 0);
  };

  const handleSubmit = (values, { setSubmitting }) => {
    onSubmit(values);
    setSubmitting(false);
  };

  const getProductById = (productId) => {
    return products.find(p => p._id === productId);
  };

  // Custom Select component for products
  const ProductSelect = ({ field, form, index }) => {
    const handleChange = (e) => {
      const productId = e.target.value;
      form.setFieldValue(field.name, productId);
      
      if (productId) {
        const product = getProductById(productId);
        if (product) {
          form.setFieldValue(`products.${index}.sellingPrice`, product.sellingPrice || 0);
          // Validate stock availability
          if (product.quantity < form.values.products[index].quantity) {
            form.setFieldError(`products.${index}.quantity`, `Only ${product.quantity} available in stock`);
          }
        }
      }
    };

    return (
      <select
        className="form-select"
        value={field.value || ""}
        onChange={handleChange}
        onBlur={field.onBlur}
      >
        <option value="">Select Product</option>
        {products.map((product) => (
          <option key={product._id} value={product._id}>
            {product.name} (SKU: {product.sku}) - Stock: {product.quantity} - Price: ${product.sellingPrice}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-receipt-cutoff me-2"></i>
              Create Invoice
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
              {({ values, setFieldValue, isSubmitting, errors, touched }) => (
                <Form>
                  <div className="modal-body">
                    <div className="row g-3">
                      {/* Invoice Number & Customer Name */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">
                          Invoice Number *
                        </label>
                        <Field
                          type="text"
                          name="invoiceNumber"
                          className="form-control"
                          placeholder="e.g., INV-1001"
                        />
                        <ErrorMessage
                          name="invoiceNumber"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">
                          Customer Name *
                        </label>
                        <Field
                          type="text"
                          name="customerName"
                          className="form-control"
                          placeholder="e.g., Ahmed Ali"
                        />
                        <ErrorMessage
                          name="customerName"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      {/* Payment Method */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">
                          Payment Method *
                        </label>
                        <Field as="select" name="paymentMethod" className="form-select">
                          <option value="cash">Cash</option>
                          <option value="card">Credit/Debit Card</option>
                          <option value="bank">Bank Transfer</option>
                          <option value="wallet">Digital Wallet</option>
                        </Field>
                        <ErrorMessage
                          name="paymentMethod"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      {/* Total Amount Preview */}
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded">
                          <div className="small text-muted">Total Amount</div>
                          <h4 className="fw-bold text-danger mb-0">
                            ${calculateTotal(values.products).toFixed(2)}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Products Section */}
                    <div className="mt-4">
                      <h6 className="fw-bold text-muted border-bottom pb-2">
                        <i className="bi bi-box me-2"></i>
                        Products
                      </h6>

                      <FieldArray name="products">
                        {({ push, remove }) => (
                          <>
                            {values.products.map((item, index) => {
                              const selectedProduct = getProductById(item.product);
                              const availableStock = selectedProduct?.quantity || 0;
                              
                              return (
                                <div key={index} className="row g-3 mb-3 border rounded p-3 bg-light">
                                  <div className="col-md-5">
                                    <label className="form-label small fw-semibold text-muted">
                                      Product *
                                    </label>
                                    <Field
                                      name={`products.${index}.product`}
                                      component={ProductSelect}
                                      index={index}
                                    />
                                    <ErrorMessage
                                      name={`products.${index}.product`}
                                      component="div"
                                      className="text-danger small mt-1"
                                    />
                                    {selectedProduct && (
                                      <div className="small mt-1">
                                        <span className="text-muted">Available: </span>
                                        <span className={`fw-bold ${availableStock < item.quantity ? 'text-danger' : 'text-success'}`}>
                                          {availableStock}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">
                                      Quantity *
                                    </label>
                                    <Field
                                      type="number"
                                      name={`products.${index}.quantity`}
                                      className="form-control"
                                      min="1"
                                      max={availableStock}
                                      onChange={(e) => {
                                        const quantity = parseInt(e.target.value) || 0;
                                        setFieldValue(`products.${index}.quantity`, quantity);
                                        
                                        // Check stock availability
                                        if (selectedProduct && quantity > availableStock) {
                                          setFieldValue(`products.${index}.quantity`, availableStock);
                                          setFieldError(`products.${index}.quantity`, `Only ${availableStock} available`);
                                        }
                                      }}
                                    />
                                    <ErrorMessage
                                      name={`products.${index}.quantity`}
                                      component="div"
                                      className="text-danger small mt-1"
                                    />
                                  </div>

                                  <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">
                                      Selling Price *
                                    </label>
                                    <div className="input-group">
                                      <span className="input-group-text">$</span>
                                      <Field
                                        type="number"
                                        step="0.01"
                                        name={`products.${index}.sellingPrice`}
                                        className="form-control"
                                        min="0.01"
                                      />
                                    </div>
                                    <ErrorMessage
                                      name={`products.${index}.sellingPrice`}
                                      component="div"
                                      className="text-danger small mt-1"
                                    />
                                  </div>

                                  <div className="col-md-1 d-flex align-items-end">
                                    {values.products.length > 1 && (
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => remove(index)}
                                        disabled={loading}
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    )}
                                  </div>

                                  {/* Subtotal */}
                                  <div className="col-12 mt-2">
                                    <div className="bg-white p-2 rounded border d-flex justify-content-between align-items-center">
                                      <div>
                                        <span className="small text-muted">Subtotal: </span>
                                        <span className="fw-bold">
                                          ${((item.quantity || 0) * (item.sellingPrice || 0)).toFixed(2)}
                                        </span>
                                      </div>
                                      {selectedProduct && (
                                        <div className="small text-muted">
                                          Stock after sale: {availableStock - (item.quantity || 0)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                              onClick={() => push({ product: "", quantity: 1, sellingPrice: 0 })}
                              disabled={loading}
                            >
                              <i className="bi bi-plus-circle"></i>
                              Add Another Product
                            </button>
                          </>
                        )}
                      </FieldArray>
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Create Invoice
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

// Helper function for setFieldError
const setFieldError = (field, message) => {
  // This function would be available in Formik context
  // We'll handle errors through Formik's built-in validation
};

export default InvoiceForm;