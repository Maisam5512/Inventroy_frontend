// components/StaffMemberForm.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const StaffMemberForm = ({ onSubmit, onClose, loading }) => {
  const staffValidationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    role: Yup.string().required("Select role"),
  });

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-person-plus me-2"></i>Add New Staff Member
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
              name: "",
              email: "",
              password: "",
              role: "staff",
            }}
            validationSchema={staffValidationSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              onSubmit(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">
                      Full Name *
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

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">
                      Email Address *
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="form-control form-control-sm"
                      placeholder="staff@example.com"
                    />
                    <div className="text-danger small">
                      <ErrorMessage name="email" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">
                      Password *
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className="form-control form-control-sm"
                      placeholder="••••••••"
                    />
                    <div className="text-danger small">
                      <ErrorMessage name="password" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">
                      Role *
                    </label>
                    <Field
                      as="select"
                      name="role"
                      className="form-select form-select-sm"
                    >
                      <option value="staff">Staff Member</option>
                      <option value="admin">Administrator</option>
                    </Field>
                    <div className="text-danger small">
                      <ErrorMessage name="role" />
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
                    className="btn btn-info btn-sm"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Adding...
                      </>
                    ) : (
                      "Add Member"
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

export default StaffMemberForm;