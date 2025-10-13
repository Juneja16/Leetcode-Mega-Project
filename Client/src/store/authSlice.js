// src/store/authSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // Backend sets HttpOnly cookie here
      const response = await axiosClient.post("/user/login", credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/user/check");
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Session expired"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authReady: false, // NEW: becomes true after checkAuth runs (success or fail)
};

const setPending = (state) => {
  state.loading = true;
  state.error = null;
};

const setRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload || "Something went wrong";
  state.isAuthenticated = false;
  state.user = null;
};

const authSlice2 = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, setPending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.authReady = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        setRejected(state, action);
      })

      // Login
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        setRejected(state, action);
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.authReady = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        setRejected(state, action);
        state.authReady = true; // IMPORTANT: even if check failed, we mark ready so app can render login routes
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.authReady = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        setRejected(state, action);
        state.authReady = true;
      });
  },
});

export default authSlice2.reducer;

/* The is the Brain of the Application or "the Source of Truth " 
 for all the authentication information in the App.
 
 1. the async thunk are the messengers 
 2. the initial state is the Tracker Board

   const initialState = {
  user: null,             // The user object (name, email, ID) or null if logged out.
  isAuthenticated: false, // True/False: Are they currently logged in?
  loading: false,         // True/False: Is an API call currently running (e.g., waiting for login response)?
  error: null,            // Stores any error message from the API (e.g., "Invalid password").
  authReady: false,       // **The Key Flag:** Has the initial session check completed?
};

3.The extraReducers section is the heart of the slice. 
It tells the "Brain" exactly how to update the Tracker Board (the state) 
for every single possible outcome of the four Messengers above.

Every Messenger has three stages:

Stage	What It Means	State Changes (setPending/setRejected)
1..pending	The API call just started (e.g., user clicked Login).	
loading turns true. error is cleared.
2..fulfilled	The API call succeeded (e.g., login was successful).	
loading turns false. user is populated. isAuthenticated turns true.
3..rejected	The API call failed (e.g., wrong password, session expired).	
loading turns false. error stores the message. isAuthenticated turns false.


Notice how authReady is handled only in the checkAuth stages:
checkAuth.fulfilled: state.authReady = true; (We successfully checked the session.)
checkAuth.rejected: state.authReady = true; (We failed to check the session, 
but the check itself is complete.)
*/
