import Joi from "joi";

export const userRegisterSchema = Joi.object({
  firstName: Joi.string().min(1).max(20).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name is required",
    "string.max": "First name must be under 20 characters",
    "any.required": "First name is required",
  }),

  lastName: Joi.string().min(1).max(20).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name is required",
    "string.max": "Last name must be under 20 characters",
    "any.required": "Last name is required",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[0-9]/, "number")
    .pattern(/[@$!%*?&]/, "special")
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.name":
        "Password must contain at least one {#name} letter",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
});

export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});


export const adminRegisterSchema = Joi.object({
  firstName: Joi.string().min(1).max(20).required(),
  lastName: Joi.string().min(1).max(20).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[0-9]/, "number")
    .pattern(/[@$!%*?&]/, "special")
    .required(),
});



/*
So Joi = Zod’s backend twin 👯

Zod → frontend form validation (TypeScript + React friendly)

Joi → backend request validation (Express + Node friendly)

Both do the same job — just in different environments.

🧩 Step 5: How All This Connects

✅ Frontend (Zod): stops user from submitting invalid data.
✅ Backend (Validate / Joi): double-checks that no invalid or missing data sneaks through.

So if both sides validate the same schema, your app is much more reliable and secure 
 */

/*

🔹 Frontend (Zod)

Runs immediately on form submit.

Prevents bad data (short password, invalid email, etc.).

🔹 Backend (Joi)

Runs before saving to database.

Catches any malformed/missing/unsafe input (in case someone bypasses frontend).
 */