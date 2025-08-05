// src/api/auth.js
const API_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (identifier, password) => {
  try {
    // Detect if identifier is email, NISN, or username
    const isEmail = identifier.includes("@");
    const isNISN = /^\d+$/.test(identifier); // NISN is typically all numbers

    let payload;
    if (isEmail) {
      payload = { email: identifier, password };
    } else if (isNISN) {
      payload = { nisn: identifier, password };
    } else {
      payload = { username: identifier, password };
    }

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login gagal");
    }

    const data = await response.json();
    return data; // biasanya berisi token dan user role
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getRole = () => localStorage.getItem("role");
export const getToken = () => localStorage.getItem("token");

// Additional utility functions for better auth management
export const setAuthData = (token, role, user = null) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  const token = getToken();
  const role = getRole();
  return !!(token && role);
};

export const isStudent = () => {
  return getRole() === "student";
};

export const isTeacher = () => {
  return getRole() === "teacher";
};

export const isBK = () => {
  return getRole() === "bk";
};

export const isSuperAdmin = () => {
  return getRole() === "superadmin";
};

// Validate identifier type
export const getIdentifierType = (identifier) => {
  if (identifier.includes("@")) {
    return "email";
  } else if (/^\d+$/.test(identifier)) {
    return "nisn";
  } else {
    return "username";
  }
};
