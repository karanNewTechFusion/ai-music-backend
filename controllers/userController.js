import supabase from '../services/supabaseClient.js';

export const signUpUser = async (req, res) => {
  console.log("in side the signUpUser controller");
  console.log("Body:", req.body);

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Supabase Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ user: data.user });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


export const loginUser = async (req, res) => {
  console.log("Inside loginUser controller");
  console.log("Body:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Login Error:", error.message);
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json({
      user: data.user,
      session: data.session, 
    });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshUserSession = async (req, res) => {
  console.log("Inside refreshUserSession controller");
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
      console.error("Refresh Error:", error.message);
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json({
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};