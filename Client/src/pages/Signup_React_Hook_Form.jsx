import { useForm } from "react-hook-form";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <>
      {/* handle submit will first validate the data against validators if errors are there
      it will show errors and if no error then data is consoled and then it 
      executes the Submit Fxn  */}
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        {/* this is gona register my input in RHK and RHK manages then all 
        state and event Handlers and  firstName is name attribute */}
        <input {...register("firstName")} />
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          })}
        />
        {/*   this is gona register my input email to RHK and this time there are
            Validation Rules for this Input that it is required compulsory
             and it should match the above pattern */}
        <input {...register("age", { pattern: /\d+/ })} />
        {errors.age && <p>Please enter number for age.</p>}

        {/* Now there is age input that is going to register with RHK and also 
          a validation rule for pattern  and thus the errors are shown if the Validation rules 
          are empty  */}
      </form>
      hello
    </>
  );
};

export default Signup;
