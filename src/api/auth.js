// src/api/auth.js
const API_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login gagal");
    }

    const data = await response.json();
    return data; // biasanya berisi token dan user role
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getRole = () => localStorage.getItem('role');
export const getToken = () => localStorage.getItem('token');
