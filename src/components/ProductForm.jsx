// components/ProductForm.jsx
import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useVendors from "../hooks/useVendors";
import useCategories from "../hooks/useCategories";

const ProductForm = ({ onSubmit, onClose, loading, initialValues = null }) => {
  const { vendors, fetchVendors, loading: vendorsLoading } = useVendors();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();

  // Fetch vendors and categories on component mount
  useEffect(() => {
    fetchVendors();
    fetchCategories();
  }, []);

  // Validation schema
  const productValidationSchema = Yup.object({
    name: Yup.string().required("Product name is required"),
    sku: Yup.string().required("SKU is required").uppercase(),
    description: Yup.string(),
    category: Yup.string().required("Category is required"),
    purchasePrice: Yup.number()
      .required("Purchase price is required")
      .min(0, "Price cannot be negative"),
    sellingPrice: Yup.number()
      .required("Selling price is required")
      .min(0, "Price cannot be negative")
      .test(
        "sellingPrice",
        "Selling price must be greater than purchase price",
        function (value) {
          const { purchasePrice } = this.parent;
          return value >= purchasePrice;
        }
      ),
    quantity: Yup.number()
      .min(0, "Quantity cannot be negative")
      .default(0),
    unit: Yup.string().required("Unit is required"),
    location: Yup.string(),
    lowStockThreshold: Yup.number()
      .min(1, "Low stock threshold must be at least 1")
      .default(5),
    supplier: Yup.string(),
    barcode: Yup.string(),
    expiryDate: Yup.date(),
    image: Yup.string().url("Must be a valid URL"),
  });

  // Default values for new product
  const defaultValues = {
    name: "",
    sku: "",
    description: "",
    category: "",
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    unit: "pcs",
    location: "",
    lowStockThreshold: 5,
    supplier: "",
    barcode: "",
    expiryDate: "",
    image: "",
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-box me-2"></i>
              {initialValues ? "Edit Product" : "Add New Product"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <Formik
            initialValues={initialValues || defaultValues}
            validationSchema={productValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
              onSubmit(values);
              setSubmitting(false);
            }}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Basic Information */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Product Name *
                      </label>
                      <Field
                        type="text"
                        name="name"
                        className="form-control form-control-sm"
                        placeholder="HP Wireless Keyboard"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="name" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        SKU *
                      </label>
                      <Field
                        type="text"
                        name="sku"
                        className="form-control form-control-sm"
                        placeholder="HP-KEYBOARD-001"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="sku" />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">
                        Description
                      </label>
                      <Field
                        as="textarea"
                        name="description"
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Product description..."
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="description" />
                      </div>
                    </div>

                    {/* Category and Supplier */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Category *
                      </label>
                      <Field
                        as="select"
                        name="category"
                        className="form-select form-select-sm"
                        disabled={categoriesLoading}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </Field>
                      <div className="text-danger small">
                        <ErrorMessage name="category" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Supplier (Vendor)
                      </label>
                      <Field
                        as="select"
                        name="supplier"
                        className="form-select form-select-sm"
                        disabled={vendorsLoading}
                      >
                        <option value="">Select Supplier</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor._id}>
                            {vendor.name} - {vendor.companyName}
                          </option>
                        ))}
                      </Field>
                      <div className="text-danger small">
                        <ErrorMessage name="supplier" />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Purchase Price *
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">₹</span>
                        <Field
                          type="number"
                          name="purchasePrice"
                          className="form-control"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="text-danger small">
                        <ErrorMessage name="purchasePrice" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Selling Price *
                      </label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">₹</span>
                        <Field
                          type="number"
                          name="sellingPrice"
                          className="form-control"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="text-danger small">
                        <ErrorMessage name="sellingPrice" />
                      </div>
                    </div>

                    {/* Stock Information */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">
                        Quantity
                      </label>
                      <Field
                        type="number"
                        name="quantity"
                        className="form-control form-control-sm"
                        min="0"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="quantity" />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">
                        Unit *
                      </label>
                      <Field
                        as="select"
                        name="unit"
                        className="form-select form-select-sm"
                      >
                        <option value="pcs">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="L">Liters</option>
                        <option value="mL">Milliliters</option>
                        <option value="m">Meters</option>
                        <option value="cm">Centimeters</option>
                        <option value="box">Box</option>
                        <option value="pack">Pack</option>
                      </Field>
                      <div className="text-danger small">
                        <ErrorMessage name="unit" />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">
                        Low Stock Threshold
                      </label>
                      <Field
                        type="number"
                        name="lowStockThreshold"
                        className="form-control form-control-sm"
                        min="1"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="lowStockThreshold" />
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Location
                      </label>
                      <Field
                        type="text"
                        name="location"
                        className="form-control form-control-sm"
                        placeholder="Rack A1, Shelf 2"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="location" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Barcode
                      </label>
                      <Field
                        type="text"
                        name="barcode"
                        className="form-control form-control-sm"
                        placeholder="8901234567891"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="barcode" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Expiry Date
                      </label>
                      <Field
                        type="date"
                        name="expiryDate"
                        className="form-control form-control-sm"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="expiryDate" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Image URL
                      </label>
                      <Field
                        type="text"
                        name="image"
                        className="form-control form-control-sm"
                        placeholder="https://example.com/product.jpg"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="image" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger btn-sm"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        {initialValues ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      initialValues ? "Update Product" : "Add Product"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;