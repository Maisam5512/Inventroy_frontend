import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import useVendors from "../hooks/useVendors";
import useProducts from "../hooks/useProducts";

const PurchaseOrderForm = ({ onSubmit, onClose, loading, initialValues }) => {
  const { vendors, fetchVendors } = useVendors();
  const { products, fetchProducts } = useProducts();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formattedInitialValues, setFormattedInitialValues] = useState(null);

  // Fetch vendors and products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      await Promise.all([fetchVendors(), fetchProducts()]);
      setIsLoadingData(false);
    };
    fetchData();
  }, []);

  // Format initial values when products/vendors are loaded
  useEffect(() => {
    if (!isLoadingData && initialValues) {
      const formatValues = {
        ...initialValues,
        vendor: initialValues.vendor?._id || initialValues.vendor,
        expectedDeliveryDate: initialValues.expectedDeliveryDate 
          ? new Date(initialValues.expectedDeliveryDate).toISOString().split('T')[0]
          : '',
        products: initialValues.products?.map(item => ({
          product: item.product?._id || item.product,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
        })) || [{ product: "", quantity: 1, purchasePrice: 0 }]
      };
      setFormattedInitialValues(formatValues);
    }
  }, [initialValues, isLoadingData]);

  const validationSchema = Yup.object({
    orderNumber: Yup.string().required("Order number is required"),
    vendor: Yup.string().required("Vendor is required"),
    expectedDeliveryDate: Yup.date().required("Expected delivery date is required"),
    products: Yup.array()
      .of(
        Yup.object().shape({
          product: Yup.string().required("Product is required"),
          quantity: Yup.number().min(1, "Minimum 1").required("Quantity is required"),
          purchasePrice: Yup.number().min(0.01, "Must be greater than 0").required("Purchase price is required"),
        })
      )
      .min(1, "At least one product is required"),
  });

  // Determine initial form values
  const getInitialFormValues = () => {
    if (formattedInitialValues) {
      return formattedInitialValues;
    }
    
    if (initialValues) {
      return {
        orderNumber: initialValues.orderNumber || `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        vendor: "",
        expectedDeliveryDate: "",
        products: [{ product: "", quantity: 1, purchasePrice: 0 }],
      };
    }
    
    return {
      orderNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      vendor: "",
      expectedDeliveryDate: "",
      products: [{ product: "", quantity: 1, purchasePrice: 0 }],
    };
  };

  const calculateTotal = (products) => {
    return products.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.purchasePrice) || 0;
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

  // Custom Select component for products that properly updates Formik
  const ProductSelect = ({ field, form, index }) => {
    const handleChange = (e) => {
      const productId = e.target.value;
      // Update the product field
      form.setFieldValue(field.name, productId);
      
      // If a product is selected, update the purchase price
      if (productId) {
        const product = getProductById(productId);
        if (product) {
          form.setFieldValue(`products.${index}.purchasePrice`, product.purchasePrice || 0);
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
            {product.name} (SKU: {product.sku}) - ${product.purchasePrice}
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
              <i className="bi bi-receipt me-2"></i>
              {initialValues ? "Edit Purchase Order" : "Create Purchase Order"}
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
              <p className="mt-3 text-muted">Loading products and vendors...</p>
            </div>
          ) : (
            <Formik
              key={initialValues?._id || 'new'}
              initialValues={getInitialFormValues()}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ values, setFieldValue, isSubmitting, errors, touched }) => (
                <Form>
                  <div className="modal-body">
                    <div className="row g-3">
                      {/* Order Number & Vendor */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">
                          Order Number *
                        </label>
                        <Field
                          type="text"
                          name="orderNumber"
                          className="form-control"
                          placeholder="e.g., PO-1001"
                          disabled={initialValues}
                        />
                        <ErrorMessage
                          name="orderNumber"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">
                          Vendor *
                        </label>
                        <Field as="select" name="vendor" className="form-select">
                          <option value="">Select Vendor</option>
                          {vendors.map((vendor) => (
                            <option key={vendor._id} value={vendor._id}>
                              {vendor.name} ({vendor.companyName})
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="vendor"
                          component="div"
                          className="text-danger small mt-1"
                        />
                      </div>

                      {/* Expected Delivery Date */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">
                          Expected Delivery Date *
                        </label>
                        <Field
                          type="date"
                          name="expectedDeliveryDate"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="expectedDeliveryDate"
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
                            {values.products.map((item, index) => (
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
                                  {item.product && !products.find(p => p._id === item.product) && (
                                    <div className="text-warning small mt-1">
                                      Product not found in inventory
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
                                  />
                                  <ErrorMessage
                                    name={`products.${index}.quantity`}
                                    component="div"
                                    className="text-danger small mt-1"
                                  />
                                </div>

                                <div className="col-md-3">
                                  <label className="form-label small fw-semibold text-muted">
                                    Purchase Price *
                                  </label>
                                  <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <Field
                                      type="number"
                                      step="0.01"
                                      name={`products.${index}.purchasePrice`}
                                      className="form-control"
                                      min="0.01"
                                    />
                                  </div>
                                  <ErrorMessage
                                    name={`products.${index}.purchasePrice`}
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
                                    <span className="small text-muted">Subtotal: </span>
                                    <span className="fw-bold">
                                      ${((item.quantity || 0) * (item.purchasePrice || 0)).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                              onClick={() => push({ product: "", quantity: 1, purchasePrice: 0 })}
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
                          {initialValues ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          {initialValues ? "Update Order" : "Create Order"}
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

export default PurchaseOrderForm;