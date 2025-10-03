import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(20, "First name must be under 20 characters"),
  lastName: z
    .string()
    .min(1, "First name is required")
    .max(20, "First name must be under 20 characters"),
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const onSubmit = (data) => {
    console.log(data);

    // Backend data ko send kar dena chaiye?
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {" "}
      {/* Centering container */}
      <div className="card w-96 bg-base-100 shadow-xl">
        {" "}
        {/* Existing card styling */}
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl">Leetcode</h2>{" "}
          {/* Centered title */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Existing form fields */}
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

            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                placeholder="John"
                className={`input input-bordered ${
                  errors.lastName && "input-error"
                }`}
                {...register("lastName")}
              />
              {errors.lastName && (
                <span className="text-error">{errors.last.message}</span>
              )}
            </div>

            <div className="form-control  mt-4">
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
              {errors.emailId && (
                <span className="text-error">{errors.emailId.message}</span>
              )}
            </div>

            <div className="form-control mt-4">
              <label className="label mb-1">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`input input-bordered ${
                  errors.password && "input-error"
                }`}
                {...register("password")}
              />
              {errors.password && (
                <span className="text-error">{errors.password.message}</span>
              )}
            </div>

            <div className="form-control mt-6 flex justify-center">
              <button type="submit" className="btn btn-primary">
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
