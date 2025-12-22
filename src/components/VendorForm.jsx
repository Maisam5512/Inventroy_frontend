import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const VendorForm = ({ onSubmit, onClose, loading, initialData, isEditing }) => {
  const vendorValidationSchema = Yup.object({
    name: Yup.string().required("Vendor name is required"),
    companyName: Yup.string().required("Company name is required"),
    email: Yup.string().email("Invalid email format"),
    phone: Yup.string(),
    address: Yup.string(),
    notes: Yup.string(),
    ...(isEditing && { status: Yup.string().oneOf(["active", "inactive"], "Invalid status") })
  });

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              <i className={`bi ${isEditing ? "bi-pencil" : "bi-person-plus"} me-2`}></i>
              {isEditing ? "Edit Vendor" : "Add New Vendor"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <Formik
            initialValues={{
              name: initialData?.name || "",
              companyName: initialData?.companyName || "",
              email: initialData?.email || "",
              phone: initialData?.phone || "",
              address: initialData?.address || "",
              notes: initialData?.notes || "",
              ...(isEditing && { status: initialData?.status || "active" })
            }}
            validationSchema={vendorValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
              onSubmit(values);
              setSubmitting(false);
            }}
            enableReinitialize={true}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Vendor Name *
                      </label>
                      <Field
                        type="text"
                        name="name"
                        className="form-control form-control-sm"
                        placeholder="John Doe"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="name" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Company Name *
                      </label>
                      <Field
                        type="text"
                        name="companyName"
                        className="form-control form-control-sm"
                        placeholder="ABC Corporation"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="companyName" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Email Address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        className="form-control form-control-sm"
                        placeholder="vendor@example.com"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="email" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Phone Number
                      </label>
                      <Field
                        type="text"
                        name="phone"
                        className="form-control form-control-sm"
                        placeholder="+92-300-1234567"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="phone" />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">
                        Address
                      </label>
                      <Field
                        type="text"
                        name="address"
                        className="form-control form-control-sm"
                        placeholder="Street, City, Country"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="address" />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">
                        Notes
                      </label>
                      <Field
                        as="textarea"
                        name="notes"
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Additional information about this vendor..."
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="notes" />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-muted">
                          Status
                        </label>
                        <Field
                          as="select"
                          name="status"
                          className="form-select form-select-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </Field>
                        <div className="text-danger small">
                          <ErrorMessage name="status" />
                        </div>
                      </div>
                    )}
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
                    className="btn btn-primary btn-sm"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        {isEditing ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      isEditing ? "Update Vendor" : "Add Vendor"
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

export default VendorForm;