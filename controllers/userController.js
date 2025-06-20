
import supabase from '../services/supabaseClient.js';
import { sendResponse } from '../utility/responseHelper.js';

// ✅ SIGNUP
export const signUpUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, false, 400, "Email and password are required");
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      return sendResponse(res, false, 400, error.message);
    }

    return sendResponse(res, true, 200, "User signed up successfully", { user: data.user });
  } catch (err) {
    return sendResponse(res, false, 500, "Server error",err);
  }
};

// ✅ LOGIN
export const loginUser = async (req, res) => {
  console.log("🔐 [loginUser] Request body:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, false, 400, "Email and password are required");
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return sendResponse(res, false, 401, error.message);
    }

    return sendResponse(res, true, 200, "Login successful", {
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    return sendResponse(res, false, 500, "Server error");
  }
};

// ✅ REFRESH TOKEN
export const refreshUserSession = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return sendResponse(res, false, 400, "Refresh token is required");
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
      
      return sendResponse(res, false, 401, error.message);
    }

    return sendResponse(res, true, 200, "Session refreshed", {
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    return sendResponse(res, false, 500, "Server error");
  }
};
