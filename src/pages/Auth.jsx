// import React, { useState } from "react";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import useAuth from "../hooks/useAuth";

// const Auth = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const { loginUser, registerUser, loading } = useAuth();

//   // ------------------ VALIDATION SCHEMA ------------------
//   const validationSchema = Yup.object({
//     email: Yup.string().email("Invalid email").required("Email required"),
//     password: Yup.string().min(6, "Min 6 characters").required("Password required"),
//     role: Yup.string().required("Select access level"),
//     ...(isLogin
//       ? {}
//       : {
//           name: Yup.string().required("Name required"),
//         }),
//   });

//   return (
//     <div
//       className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
//       style={{
//         background: "linear-gradient(180deg, #f8f9fa 0%, #eef1f4 100%)",
//       }}
//     >
//       <div
//         className="card border-0 shadow-lg overflow-hidden w-100"
//         style={{ maxWidth: "900px", borderRadius: "18px" }}
//       >
//         <div className="row g-0">

//           {/* LEFT BRAND PANEL */}
//           <div
//             className="col-md-6 d-none d-md-flex align-items-center justify-content-center text-white text-center p-5"
//             style={{
//               background: "linear-gradient(135deg, #1f2933 0%, #2c2e3e 100%)",
//             }}
//           >
//             <div>
//               <h1 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
//                 <i className="bi bi-box-seam-fill"></i> Stockly
//               </h1>
//               <p className="text-white-50 mb-0">
//                 Inventory management for growing businesses
//               </p>
//             </div>
//           </div>

//           {/* RIGHT FORM PANEL */}
//           <div className="col-md-6 bg-white p-4 p-md-5">
//             <div className="text-center mb-4">
//               <h4 className="fw-bold text-dark mb-1">
//                 {isLogin ? "Welcome Back" : "Create Account"}
//               </h4>
//               <p className="text-muted small">
//                 {isLogin ? "Sign in to continue" : "Register to get started"}
//               </p>
//             </div>

//             {/* FORMIK FORM */}
//             <Formik
//               initialValues={{
//                 name: "",
//                 email: "",
//                 password: "",
//                 role: "staff",
//               }}
//               validationSchema={validationSchema}
//               onSubmit={async (values) => {
//                 if (isLogin) {
//                   await loginUser(values.email, values.password);
//                 } else {
//                   await registerUser(values);
//                 }
//               }}
//             >
//               {() => (
//                 <Form>
//                   {/* FULL NAME (ONLY REGISTER) */}
//                   {!isLogin && (
//                     <div className="mb-3">
//                       <label className="form-label small fw-semibold text-muted">
//                         Full Name
//                       </label>
//                       <div className="input-group">
//                         <span className="input-group-text bg-light border-0">
//                           <i className="bi bi-person-fill text-secondary"></i>
//                         </span>
//                         <Field
//                           type="text"
//                           name="name"
//                           className="form-control form-control-lg bg-light border-0 auth-focus"
//                           placeholder="John Doe"
//                         />
//                       </div>
//                       <div className="text-danger small mt-1">
//                         <ErrorMessage name="name" />
//                       </div>
//                     </div>
//                   )}

//                   {/* EMAIL */}
//                   <div className="mb-3">
//                     <label className="form-label small fw-semibold text-muted">
//                       Email Address
//                     </label>
//                     <div className="input-group">
//                       <span className="input-group-text bg-light border-0">
//                         <i className="bi bi-envelope-fill text-secondary"></i>
//                       </span>
//                       <Field
//                         type="email"
//                         name="email"
//                         className="form-control form-control-lg bg-light border-0 auth-focus"
//                         placeholder="admin@example.com"
//                       />
//                     </div>
//                     <div className="text-danger small mt-1">
//                       <ErrorMessage name="email" />
//                     </div>
//                   </div>

//                   {/* PASSWORD */}
//                   <div className="mb-3">
//                     <label className="form-label small fw-semibold text-muted">
//                       Password
//                     </label>
//                     <div className="input-group">
//                       <span className="input-group-text bg-light border-0">
//                         <i className="bi bi-lock-fill text-secondary"></i>
//                       </span>
//                       <Field
//                         type="password"
//                         name="password"
//                         className="form-control form-control-lg bg-light border-0 auth-focus"
//                         placeholder="••••••••"
//                       />
//                     </div>
//                     <div className="text-danger small mt-1">
//                       <ErrorMessage name="password" />
//                     </div>
//                   </div>

//                   {/* ROLE */}
//                   <div className="mb-4">
//                     <label className="form-label small fw-semibold text-muted">
//                       Access Level
//                     </label>
//                     <div className="input-group">
//                       <span className="input-group-text bg-light border-0">
//                         <i className="bi bi-person-badge-fill text-secondary"></i>
//                       </span>

//                       <Field
//                         as="select"
//                         name="role"
//                         className="form-select form-select-lg bg-light border-0 auth-focus"
//                       >
//                         <option value="admin">Administrator</option>
//                         <option value="staff">Staff Member</option>
//                       </Field>
//                     </div>
//                     <div className="text-danger small mt-1">
//                       <ErrorMessage name="role" />
//                     </div>
//                   </div>

//                   {/* SUBMIT BUTTON */}
//                   <button
//                     type="submit"
//                     className="btn btn-danger btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
//                     disabled={loading}
//                   >
//                     <i className="bi bi-box-arrow-in-right"></i>
//                     {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
//                   </button>
//                 </Form>
//               )}
//             </Formik>

//             {/* SWITCH LOGIN / REGISTER */}
//             <div className="text-center mt-4 small">
//               <span className="text-dark">
//                 {isLogin ? "Don't have an account?" : "Already have an account?"}
//               </span>{" "}
//               <button
//                 className="btn btn-link p-0 fw-bold text-danger text-decoration-none"
//                 onClick={() => setIsLogin(!isLogin)}
//               >
//                 {isLogin ? "Register" : "Login"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;













import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  // ------------------ VALIDATION SCHEMA ------------------
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    role: Yup.string().required("Select an access level"),
  });

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
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
          <div className="col-md-6 bg-white p-4 p-md-5">
            <div className="text-center mb-4">
              <h4 className="fw-bold text-dark mb-1">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h4>
              <p className="text-muted small">
                Sign in to access your dashboard
              </p>
            </div>

            {/* ------------------ FORMIK FORM ------------------ */}
            <Formik
              initialValues={{
                email: "",
                password: "",
                role: "staff", // ✔ Correct default value for backend enum
              }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                console.log("Form Submitted:", values);
                onLogin({ role: values.role });
              }}
            >
              {() => (
                <Form>
                  {/* EMAIL FIELD */}
                  <div className="mb-3">
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
                        className="form-control form-control-lg bg-light border-0 auth-focus"
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="text-danger small mt-1">
                      <ErrorMessage name="email" />
                    </div>
                  </div>

                  {/* PASSWORD FIELD */}
                  <div className="mb-3">
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
                        className="form-control form-control-lg bg-light border-0 auth-focus"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="text-danger small mt-1">
                      <ErrorMessage name="password" />
                    </div>
                  </div>

                  {/* ACCESS LEVEL FIELD */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted">
                      Access Level
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <i className="bi bi-person-badge-fill text-secondary"></i>
                      </span>

                      {/* ✔ FIXED VALUES (admin/staff) */}
                      <Field
                        as="select"
                        name="role"
                        className="form-select form-select-lg bg-light border-0 auth-focus"
                      >
                        <option value="admin">Administrator</option>
                        <option value="staff">Staff Member</option>
                      </Field>
                    </div>
                    <div className="text-danger small mt-1">
                      <ErrorMessage name="role" />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    className="btn btn-danger btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-box-arrow-in-right"></i>
                    {isLogin ? "Sign In" : "Sign Up"}
                  </button>
                </Form>
              )}
            </Formik>

            {/* SWITCH LOGIN <-> REGISTER */}
            <div className="text-center mt-4 small">
              <span className="text-dark">
                {isLogin ? "Don’t have an account?" : "Already have an account?"}
              </span>{" "}
              <button
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


