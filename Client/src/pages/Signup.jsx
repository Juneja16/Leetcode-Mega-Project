import { useState } from "react";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    e.preventDefault();
    console.log({ name, email, password });
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name: </label>
        <br />
        <input
          id="name"
          type="text"
          placeholder="Enter your Name"
          name="firstName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /> <br />
        <label htmlFor="email">Email: </label>
        <br />
        <input
          id="email"
          type="email"
          placeholder="Enter your Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /> <br />
        <label htmlFor="password">Password: </label>
        <br />
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your Password"
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /> <br />
        <button type="Submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </>
  );
};

export default Signup;

// This is a standard Form using JSX but this is not preffered much
// as state management , Validation, Error handling is too tedious here
