import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";

const Auth = () => {
  const { loginUser, registerUser } = useAuth(); // Get user from useAuth
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ------------------ VALIDATION SCHEMA ------------------
  const validationSchema = Yup.object({
    name: !isLogin ? Yup.string().required("Name is required") : Yup.string(),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    role: !isLogin ? Yup.string().required("Select role") : Yup.string(),
  });

  // Handle form submission
  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await loginUser({
          email: values.email,
          password: values.password,
        });
        
        if (res.success) {
          toast.success("Login successful");
          // The user state will be updated in useAuth, triggering App to re-render
        } else {
          toast.error(res.message || "Login failed");
        }
      } else {
        const res = await registerUser(values);
        if (res.success) {
          toast.success("Registration successful. Please login.");
          setIsLogin(true);
          resetForm();
        } else {
          toast.error(res.message || "Registration failed");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container-fluid vh-100 overflow-hidden d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(180deg, #f8f9fa 0%, #eef1f4 100%)",
      }}
    >
      <div
        className="card border-0 shadow-lg overflow-hidden w-100"
        style={{ maxWidth: "900px", borderRadius: "18px" }}
      >
        <div className="row g-0">

          {/* BRAND PANEL */}
          <div
            className="col-md-6 d-none d-md-flex align-items-center justify-content-center text-white text-center p-5"
            style={{
              background: "linear-gradient(135deg, #1f2933 0%, #2c2e3e 100%)",
            }}
          >
            <div>
              <h1 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                <i className="bi bi-box-seam-fill"></i> Stockly
              </h1>
              <p className="text-white-50 mb-0">
                Inventory management for growing businesses
              </p>
            </div>
          </div>

          {/* FORM */}
          <div
            className={`col-md-6 bg-white ${
              isLogin ? "p-4 p-md-5" : "p-3 p-md-4"
            }`}
          >
            <div className="text-center mb-3">
              <h4 className="fw-bold text-dark mb-1">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h4>
              <p className="text-muted small mb-0">
                Sign in to access your dashboard
              </p>
            </div>

            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                role: "staff",
              }}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>

                  {/* NAME (SIGNUP ONLY) */}
                  {!isLogin && (
                    <div className="mb-2">
                      <label className="form-label small fw-semibold text-muted">
                        Full Name
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <i className="bi bi-person-fill text-secondary"></i>
                        </span>
                        <Field
                          type="text"
                          name="name"
                          className="form-control form-control-lg bg-light border-0"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="text-danger small">
                        <ErrorMessage name="name" />
                      </div>
                    </div>
                  )}

                  {/* EMAIL */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-muted">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-envelope-fill text-secondary"></i>
                      </span>
                      <Field
                        type="email"
                        name="email"
                        className="form-control form-control-lg bg-light border-0"
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="text-danger small">
                      <ErrorMessage name="email" />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-muted">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-lock-fill text-secondary"></i>
                      </span>
                      <Field
                        type="password"
                        name="password"
                        className="form-control form-control-lg bg-light border-0"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="text-danger small">
                      <ErrorMessage name="password" />
                    </div>
                  </div>

                  {/* ROLE (SIGNUP ONLY) */}
                  {!isLogin && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">
                        Access Level
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <i className="bi bi-person-badge-fill text-secondary"></i>
                        </span>
                        <Field
                          as="select"
                          name="role"
                          className="form-select form-select-lg bg-light border-0"
                        >
                          <option value="admin">Administrator</option>
                          <option value="staff">Staff Member</option>
                        </Field>
                      </div>
                      <div className="text-danger small">
                        <ErrorMessage name="role" />
                      </div>
                    </div>
                  )}

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    className="btn btn-danger btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isLogin ? "Signing In..." : "Creating Account..."}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right"></i>
                        {isLogin ? "Sign In" : "Sign Up"}
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            {/* SWITCH */}
            <div className="text-center mt-3 small">
              <span className="text-dark">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>{" "}
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-danger text-decoration-none"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
