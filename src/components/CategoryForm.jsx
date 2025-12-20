import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const CategoryForm = ({ onSubmit, onClose, loading }) => {
  const categoryValidationSchema = Yup.object({
    name: Yup.string().required("Category name is required"),
    description: Yup.string(),
  });

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-folder-plus me-2"></i>Add New Category
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
              description: "",
            }}
            validationSchema={categoryValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
              onSubmit(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">
                      Category Name *
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="form-control form-control-sm"
                      placeholder="Electronics"
                    />
                    <div className="text-danger small">
                      <ErrorMessage name="name" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="Describe this category..."
                    />
                    <div className="text-danger small">
                      <ErrorMessage name="description" />
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
                    className="btn btn-success btn-sm"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Adding...
                      </>
                    ) : (
                      "Add Category"
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

export default CategoryForm;