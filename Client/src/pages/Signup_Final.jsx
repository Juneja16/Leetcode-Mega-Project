// src/pages/Signup.jsx

import { useForm } from "react-hook-form"; // For form state management and validation
import { zodResolver } from "@hookform/resolvers/zod"; // Integrates Zod with React Hook Form
import { z } from "zod"; // Zod schema validation
import { registerUser, checkAuth } from "../store/authSlice2"; // Redux actions
import { useDispatch, useSelector } from "react-redux"; // Redux hooks
import { useNavigate, NavLink } from "react-router"; // Router navigation
import { useEffect, useState } from "react"; // React hooks

// 🧾 Zod validation schema
const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(20, "First name must be under 20 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(20, "Last name must be under 20 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ⚙️ React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  // ✅ Handle signup
  const onSubmit = async (data) => {
    const resultAction = await dispatch(registerUser(data));

    if (registerUser.fulfilled.match(resultAction)) {
      // Immediately verify backend session cookie
      await dispatch(checkAuth());
      // Redirect to Home once verified
      navigate("/");
    }
  };

  // 🔁 Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl">LeetCode</h2>

          {/* 🧾 Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name */}
            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                placeholder="John"
                className={`input input-bordered ${
                  errors.firstName && "input-error"
                }`}
                {...register("firstName")}
              />
              {errors.firstName && (
                <span className="text-error">{errors.firstName.message}</span>
              )}
            </div>

            {/* Last Name */}
            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                placeholder="Smith"
                className={`input input-bordered ${
                  errors.lastName && "input-error"
                }`}
                {...register("lastName")}
              />
              {errors.lastName && (
                <span className="text-error">{errors.lastName.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered ${
                  errors.email && "input-error"
                }`}
                {...register("email")}
              />
              {errors.email && (
                <span className="text-error">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-10 ${
                    errors.password && "input-error"
                  }`}
                  {...register("password")}
                />

                {/* 👁️ Toggle password visibility */}
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>

                {errors.password && (
                  <span className="text-error">{errors.password.message}</span>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="form-control mt-6 flex justify-center">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </div>
          </form>

          {/* Login link */}
          <div className="text-center mt-6">
            <span className="text-sm">
              Already have an account?{" "}
              <NavLink to="/login" className="link link-primary">
                Login
              </NavLink>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
