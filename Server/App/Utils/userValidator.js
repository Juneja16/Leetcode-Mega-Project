import validator from "validator";

const validate = (data) => {
  if (!data) {
    throw new Error("No data provided");
  }

  const mandatoryFields = ["firstName", "lastName", "email", "password"];

  //   for (const field of mandatoryFields) {
  //     if (!data[field]) {
  //       throw new Error(`${field} is required`);
  //     }
  //   }

  const isAllowed = mandatoryFields.every((field) =>
    Object.keys(data).includes(field)
  );

  if (!isAllowed) {
    throw new Error("Missing mandatory fields");
  }

  if (!validator.isEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  if (!validator.isStrongPassword(data.password)) {
    throw new Error("Weak password");
  }

  return true;
};

const loginValidate = (data) => {
  if (!data) {
    throw new Error("No data provided");
  }

  const mandatoryFields = ["email", "password"];

  const isAllowed = mandatoryFields.every((field) =>
    Object.keys(data).includes(field)
  );

  if (!isAllowed) {
    throw new Error("Missing mandatory fields");
  }

  if (!validator.isEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  if (!validator.isStrongPassword(data.password)) {
    throw new Error("Weak password");
  }

  return true;
};
export { validate, loginValidate };
