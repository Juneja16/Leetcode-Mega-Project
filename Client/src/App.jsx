// src/App.jsx
import "./App.css";
import { Routes, Route, Navigate } from "react-router"; // react-router-dom
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import { checkAuth } from "./store/authSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loading from "./Components/Loading";
import NotFound from "./pages/NotFoundPage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { authReady, loading, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // call the thunk to validate cookie/token with backend
    dispatch(checkAuth());
  }, [dispatch]);

  // Wait until checkAuth completes to avoid flicker
  if (!authReady) return <Loading />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

/*
 Protected Route is basically the another way of writing the Element Rendering based on Ternary 
 Operator but preferred one .
 Now Second Main Point 
   1.the First Thing to happen on App Opening is the UseEffect Hook that will basically make 
   the API Call to user/check Route For Token Confirmation 
   means Frontend-> Backend call through useEffect hook and Redux asynccreateThunk fxn 

   2. Now Backend will take some time i.e 1-2 sec to verify till that we have to manage
   that Login Poge shouldnt flicker as isAuthenticated is bydefault False 
   so for that we have used authReady variable (to depict isAuthentication done )
   so in false state we are returning Loading on the Screen till the Authentication 
   got completed
   
   authReady got true even if token verifies correctly and we then Render HOME Page 
   as isAuthenticated also got true 

   authReady got true even if token verifies incorrectly and we then Render Login Page 
   as isAuthenticated is false this time 

 */
