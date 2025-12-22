import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const StaffMemberForm = ({ onSubmit, onClose, loading, initialData, isEditing }) => {
  // Create different validation schemas for add vs edit
  const getValidationSchema = () => {
    const baseSchema = {
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      role: Yup.string().required("Select role"),
    };

    // Only require password for new staff members
    if (!isEditing) {
      baseSchema.password = Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Password is required");
    }

    return Yup.object(baseSchema);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              <i className={`bi ${isEditing ? "bi-pencil" : "bi-person-plus"} me-2`}></i>
              {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
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
              email: initialData?.email || "",
              password: "",
              role: initialData?.role || "staff",
              ...(isEditing && { isActive: initialData?.isActive !== undefined ? initialData.isActive : true })
            }}
            validationSchema={getValidationSchema()}
            onSubmit={(values, { setSubmitting }) => {
              // For edit, don't send password if it's empty
              if (isEditing && !values.password) {
                const { password, ...valuesWithoutPassword } = values;
                onSubmit(valuesWithoutPassword);
              } else {
                onSubmit(values);
              }
              setSubmitting(false);
            }}
            enableReinitialize={true}
          >
            {({ isSubmitting, values }) => (
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
                      disabled={isEditing} // Email cannot be changed for existing users
                    />
                    <div className="text-danger small">
                      <ErrorMessage name="email" />
                    </div>
                    {isEditing && (
                      <small className="text-muted">
                        Email cannot be changed for existing users
                      </small>
                    )}
                  </div>

                  {!isEditing && (
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
                  )}

                  {isEditing && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">
                        Change Password (Optional)
                      </label>
                      <Field
                        type="password"
                        name="password"
                        className="form-control form-control-sm"
                        placeholder="Leave blank to keep current password"
                      />
                      <div className="text-danger small">
                        <ErrorMessage name="password" />
                      </div>
                    </div>
                  )}

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

                  {isEditing && (
                    <div className="mb-3">
                      <div className="form-check form-switch">
                        <Field
                          type="checkbox"
                          name="isActive"
                          className="form-check-input"
                          role="switch"
                          id="isActiveSwitch"
                        />
                        <label className="form-check-label small fw-semibold text-muted" htmlFor="isActiveSwitch">
                          Active Status
                        </label>
                      </div>
                      <div className="text-danger small">
                        <ErrorMessage name="isActive" />
                      </div>
                    </div>
                  )}
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
                        {isEditing ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      isEditing ? "Update Member" : "Add Member"
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